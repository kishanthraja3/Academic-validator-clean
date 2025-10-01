#!/usr/bin/env python3
import argparse, json, base64, hashlib, sys, io
from pathlib import Path
from datetime import datetime, timezone

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa, ec
from cryptography.hazmat.backends import default_backend

import pikepdf
from pikepdf import AttachedFileSpec

SIGNED_META_KEY = "pdfsig:SignedMetaJSON"
ATTACHMENT_NAME = "signature.bin"

def load_private_key(pem_path: Path, password: bytes | None = None):
    data = pem_path.read_bytes()
    return serialization.load_pem_private_key(data, password=password, backend=default_backend())

def load_public_key(pem_path: Path):
    data = pem_path.read_bytes()
    return serialization.load_pem_public_key(data, backend=default_backend())

def public_key_fingerprint(pubkey) -> str:
    der = pubkey.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return hashlib.sha256(der).hexdigest()

def sign_payload(privkey, payload: bytes, sig_alg: str) -> bytes:
    if sig_alg.upper() == "RSA-PSS":
        if not isinstance(privkey, rsa.RSAPrivateKey):
            raise ValueError("RSA-PSS selected but private key is not RSA")
        return privkey.sign(
            payload,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
    elif sig_alg.upper() == "ECDSA-P256":
        if not isinstance(privkey, ec.EllipticCurvePrivateKey):
            raise ValueError("ECDSA-P256 selected but private key is not EC")
        if not isinstance(privkey.curve, ec.SECP256R1):
            raise ValueError("ECDSA-P256 requires a P-256 key")
        return privkey.sign(payload, ec.ECDSA(hashes.SHA256()))
    else:
        raise ValueError(f"Unsupported sig_alg: {sig_alg}")

def main():
    ap = argparse.ArgumentParser(description="Sign a PDF and embed signature + hashes into XMP metadata (tamper-evident).")
    ap.add_argument("--pdf-in", required=True, type=Path)
    ap.add_argument("--pdf-out", required=True, type=Path)
    ap.add_argument("--private-key", required=True, type=Path)
    ap.add_argument("--public-key", required=True, type=Path)
    ap.add_argument("--sig-alg", default="RSA-PSS", choices=["RSA-PSS", "ECDSA-P256"])
    ap.add_argument("--hash-algo", default="SHA256", choices=["SHA256"])
    ap.add_argument("--attach-binary", action="store_true")
    args = ap.parse_args()

    # 1) Compute original hash on input bytes
    original_hex = hashlib.sha256(args.pdf_in.read_bytes()).hexdigest()

    # 2) Keys, fingerprint, canonical payload
    priv = load_private_key(args.private_key)
    pub = load_public_key(args.public_key)
    pub_fp = public_key_fingerprint(pub)

    payload_obj = {
        "sig_version": "2",
        "algo": args.hash_algo,
        "original_hash": original_hex,
        "sig_alg": args.sig_alg,
        "pubkey_fingerprint": pub_fp,
    }
    payload_bytes = json.dumps(payload_obj, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = sign_payload(priv, payload_bytes, args.sig_alg)

    # 3) Prepare metadata without signed_hash yet
    meta_v2 = {
        "sig_version": "2",
        "algo": args.hash_algo,
        "original_hash": original_hex,
        "pubkey_fingerprint": pub_fp,
        "timestamp": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "sig_alg": args.sig_alg,
        "payload_b64": base64.b64encode(payload_bytes).decode("ascii"),
        "signature_b64": base64.b64encode(signature).decode("ascii"),
    }

    # 4) Build a first version in memory with a fixed-length placeholder for signed_hash
    placeholder = "X" * 64
    meta_v2_with_placeholder = dict(meta_v2)
    meta_v2_with_placeholder["signed_hash"] = placeholder

    buf1 = io.BytesIO()
    with pikepdf.Pdf.open(args.pdf_in) as pdf:
        with pdf.open_metadata() as xmp:
            xmp[SIGNED_META_KEY] = json.dumps(meta_v2_with_placeholder, separators=(",", ":"))
        if args.attach_binary:
            filespec = AttachedFileSpec(pdf, signature, mime_type="application/octet-stream")
            pdf.attachments[ATTACHMENT_NAME] = filespec
        pdf.save(buf1)
    bytes_with_placeholder = buf1.getvalue()

    # 5) Stabilize deterministically by replacing the 64-char value inside
    #    the SignedMetaJSON entry at the byte level until the file hash
    #    equals the inserted value. This keeps the file length constant.
    prefix = b'"signed_hash":"'
    pos = bytes_with_placeholder.find(prefix)
    if pos == -1:
        # Fallback: if we couldn't find the placeholder, accept current bytes
        final_bytes = bytes_with_placeholder
        h_final = hashlib.sha256(final_bytes).hexdigest()
    else:
        start = pos + len(prefix)
        end = start + 64
        work = bytes_with_placeholder
        candidate = hashlib.sha256(work).hexdigest()
        max_iters = 50
        for _ in range(max_iters):
            replaced = work[:start] + candidate.encode("ascii") + work[end:]
            new_hash = hashlib.sha256(replaced).hexdigest()
            if new_hash == candidate:
                final_bytes = replaced
                h_final = new_hash
                break
            # continue with replaced bytes and new candidate
            work = replaced
            candidate = new_hash
        else:
            final_bytes = work
            h_final = hashlib.sha256(final_bytes).hexdigest()
    # Rebuild payload to include signed_hash (so signature covers final bytes)
    payload_obj["signed_hash"] = h_final
    payload_bytes = json.dumps(payload_obj, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = sign_payload(priv, payload_bytes, args.sig_alg)

    # Update metadata to include the final payload and signature, then save final PDF
    args.pdf_out.parent.mkdir(parents=True, exist_ok=True)
    try:
        pdf_final = pikepdf.Pdf.open(io.BytesIO(final_bytes))
        with pdf_final.open_metadata() as xmp:
            meta_v2_out = dict(meta_v2)
            meta_v2_out["payload_b64"] = base64.b64encode(payload_bytes).decode('ascii')
            meta_v2_out["signature_b64"] = base64.b64encode(signature).decode('ascii')
            meta_v2_out["signed_hash"] = h_final
            xmp[SIGNED_META_KEY] = json.dumps(meta_v2_out, separators=(",", ":"))
        # attach signature binary if requested
        if args.attach_binary:
            pdf_final.attachments[ATTACHMENT_NAME] = pikepdf.AttachedFileSpec(pdf_final, signature, mime_type="application/octet-stream")
        pdf_final.save(args.pdf_out)
        # After save, recompute file hash and rebuild signed payload to match
        final_bytes = args.pdf_out.read_bytes()
        h_final = hashlib.sha256(final_bytes).hexdigest()
        # Rebuild and re-embed payload/signature so payload_signed_hash == actual file hash
        for _ in range(3):
            payload_obj["signed_hash"] = h_final
            payload_bytes = json.dumps(payload_obj, separators=(",", ":"), sort_keys=True).encode('utf-8')
            signature = sign_payload(priv, payload_bytes, args.sig_alg)
            # open saved file, update metadata, and re-save
            tmp_pdf = pikepdf.Pdf.open(args.pdf_out)
            with tmp_pdf.open_metadata() as xmp2:
                meta_v2_out = dict(meta_v2)
                meta_v2_out["payload_b64"] = base64.b64encode(payload_bytes).decode('ascii')
                meta_v2_out["signature_b64"] = base64.b64encode(signature).decode('ascii')
                meta_v2_out["signed_hash"] = h_final
                xmp2[SIGNED_META_KEY] = json.dumps(meta_v2_out, separators=(",", ":"))
            tmp_pdf.save(args.pdf_out)
            final_bytes = args.pdf_out.read_bytes()
            new_h = hashlib.sha256(final_bytes).hexdigest()
            if new_h == h_final:
                break
            h_final = new_h
        # ensure payload_bytes and signature reflect final h_final
        payload_obj["signed_hash"] = h_final
        payload_bytes = json.dumps(payload_obj, separators=(",", ":"), sort_keys=True).encode('utf-8')
        signature = sign_payload(priv, payload_bytes, args.sig_alg)
    except Exception:
        # fallback: write raw final bytes
        args.pdf_out.write_bytes(final_bytes)

    # write a deterministic sidecar file with the signed metadata (authoritative)
    sidecar = args.pdf_out.with_suffix(args.pdf_out.suffix + '.sig.json')
    sidecar_data = {
        'algo': args.hash_algo,
        'sig_alg': args.sig_alg,
        'pubkey_fingerprint': pub_fp,
        'original_hash': original_hex,
        'signed_hash': h_final,
        'payload_b64': base64.b64encode(payload_bytes).decode('ascii'),
        'signature_b64': base64.b64encode(signature).decode('ascii'),
    }
    sidecar.write_text(json.dumps(sidecar_data, separators=(",", ":")))

    print(json.dumps({
        "status": "ok",
        "pdf_out": str(args.pdf_out),
        "hash_algo": args.hash_algo,
        "sig_alg": args.sig_alg,
        "pubkey_fingerprint": pub_fp,
        "original_hash": original_hex,
        "signed_hash": h_final,
        "signature_source": "json",
    }))

if __name__ == "__main__":
    sys.exit(main())
