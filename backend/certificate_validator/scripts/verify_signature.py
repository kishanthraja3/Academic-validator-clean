#!/usr/bin/env python3
import argparse, json, base64, hashlib, sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa, ec
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.backends import default_backend

import pikepdf

SIGNED_META_KEY = "pdfsig:SignedMetaJSON"
ATTACHMENT_NAME = "signature.bin"

def load_public_key(pem_path: Path):
    data = pem_path.read_bytes()
    return serialization.load_pem_public_key(data, backend=default_backend())

def public_key_fingerprint(pubkey) -> str:
    der = pubkey.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return hashlib.sha256(der).hexdigest()

def verify_signature(pubkey, sig_alg: str, payload: bytes, signature: bytes) -> bool:
    try:
        if sig_alg.upper() == "RSA-PSS":
            pubkey.verify(
                signature,
                payload,
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256(),
            )
            return True
        elif sig_alg.upper() == "ECDSA-P256":
            pubkey.verify(signature, payload, ec.ECDSA(hashes.SHA256()))
            return True
        else:
            return False
    except InvalidSignature:
        return False

def read_signed_meta(pdf: pikepdf.Pdf) -> tuple[dict | None, bytes | None]:
    meta_json = None
    with pdf.open_metadata() as xmp:
        val = xmp.get(SIGNED_META_KEY)
        if isinstance(val, str):
            meta_json = val
    if meta_json is None and pdf.docinfo is not None:
        val = pdf.docinfo.get("/SignedMetaJSON")
        if val:
            meta_json = str(val)
    if meta_json is None:
        return None, None
    try:
        obj = json.loads(meta_json)
    except json.JSONDecodeError:
        return None, None

    sig_bytes = None
    if "signature_b64" in obj:
        try:
            sig_bytes = base64.b64decode(obj["signature_b64"], validate=True)
        except Exception:
            sig_bytes = None
    if sig_bytes is None:
        try:
            if ATTACHMENT_NAME in pdf.attachments:
                sig_bytes = pdf.attachments[ATTACHMENT_NAME].get_file().read_bytes()
        except Exception:
            sig_bytes = None

    # Prefer a dedicated signed_hash attachment if present
    signed_hash_from_attachment = None
    try:
        if 'signed_hash.txt' in pdf.attachments:
            signed_hash_from_attachment = pdf.attachments['signed_hash.txt'].get_file().read_bytes().decode('ascii').strip()
    except Exception:
        signed_hash_from_attachment = None

    # If attachment provided a signed hash, inject it into the metadata obj for later use
    if signed_hash_from_attachment:
        obj['signed_hash'] = signed_hash_from_attachment
    return obj, sig_bytes

def main():
    ap = argparse.ArgumentParser(description="Verify PDF signature and tamper-evidence (v2).")
    ap.add_argument("--pdf-path", required=True, type=Path)
    ap.add_argument("--public-key", required=True, type=Path)
    ap.add_argument("--require-signed", action="store_true")
    ap.add_argument("--original-hash", help="Original file hash to use instead of computing from file")
    args = ap.parse_args()

    # Hash of delivered file - use original hash if provided, otherwise compute from file
    if args.original_hash:
        current_hash = args.original_hash
        print(f"Using provided original hash: {current_hash[:16]}...", file=sys.stderr)
        print(f"Full provided original hash: {current_hash}", file=sys.stderr)
    else:
        current_hash = hashlib.sha256(args.pdf_path.read_bytes()).hexdigest()
        print(f"Computed hash from file: {current_hash[:16]}...", file=sys.stderr)
        print(f"Full computed hash: {current_hash}", file=sys.stderr)

    pub = load_public_key(args.public_key)
    pub_fp = public_key_fingerprint(pub)

    # First look for a sidecar file next to the PDF (authoritative)
    sidecar = args.pdf_path.with_suffix(args.pdf_path.suffix + '.sig.json')
    meta = None
    sig_bytes = None
    if sidecar.exists():
        try:
            meta = json.loads(sidecar.read_text())
            if 'signature_b64' in meta:
                sig_bytes = base64.b64decode(meta['signature_b64'], validate=True)
        except Exception:
            meta = None

    if meta is None:
        with pikepdf.Pdf.open(args.pdf_path) as pdf:
            meta, sig_bytes = read_signed_meta(pdf)

    if meta is None:
        print(json.dumps({
            "status": "unsigned",
            "reason": "No signature metadata found",
            "hash_algo": "SHA256",
            "sig_alg": None,
            "stored_original_hash": None,
            "stored_signed_hash": None,
            "current_hash": current_hash,
            "pubkey_fingerprint_pdf": None,
            "pubkey_fingerprint_arg": pub_fp,
            "signed_present": False,
            "signature_ok": False,
            "signed_hash_match": False,
        }))
        sys.exit(1 if args.require_signed else 0)

    sig_alg = meta.get("sig_alg")
    algo = meta.get("algo")
    stored_signed_hash = meta.get("signed_hash")
    payload_b64 = meta.get("payload_b64")
    fingerprint_pdf = meta.get("pubkey_fingerprint")

    verdict = {
        "status": "unknown",
        "reason": "",
        "hash_algo": algo,
        "sig_alg": sig_alg,
        "stored_original_hash": meta.get("original_hash"),
        "stored_signed_hash": stored_signed_hash,
        "current_hash": current_hash,
        "pubkey_fingerprint_pdf": fingerprint_pdf,
        "pubkey_fingerprint_arg": pub_fp,
        "signed_present": True,
        "signature_ok": False,
        "signed_hash_match": (stored_signed_hash == current_hash),
    }

    if algo != "SHA256" or sig_alg not in ("RSA-PSS", "ECDSA-P256"):
        verdict["status"] = "invalid"; verdict["reason"] = "Unsupported algo or sig_alg"
        print(json.dumps(verdict)); sys.exit(1)

    if fingerprint_pdf and fingerprint_pdf != pub_fp:
        verdict["status"] = "invalid"; verdict["reason"] = "Public key fingerprint mismatch"
        print(json.dumps(verdict)); sys.exit(1)

    if not payload_b64 or not sig_bytes:
        verdict["status"] = "invalid"; verdict["reason"] = "Missing payload or signature"
        print(json.dumps(verdict)); sys.exit(1)

    try:
        payload = base64.b64decode(payload_b64, validate=True)
    except Exception:
        verdict["status"] = "invalid"; verdict["reason"] = "Malformed payload_b64"
        print(json.dumps(verdict)); sys.exit(1)

    signature_ok = verify_signature(pub, sig_alg, payload, sig_bytes)
    verdict["signature_ok"] = bool(signature_ok)

    if not signature_ok:
        verdict["status"] = "invalid"; verdict["reason"] = "Signature verification failed"
        print(json.dumps(verdict)); sys.exit(1)

    # Prefer the signed_hash embedded in the signed payload (it's covered by the signature)
    try:
        payload_obj = json.loads(payload.decode('utf-8'))
        payload_signed_hash = payload_obj.get("signed_hash")
    except Exception:
        payload_signed_hash = None

    compare_hash = payload_signed_hash if payload_signed_hash else stored_signed_hash

    if compare_hash != current_hash:
        verdict["status"] = "invalid"; verdict["reason"] = "Delivered file bytes differ from recorded signed_hash"
        print(json.dumps(verdict)); sys.exit(1)

    verdict["status"] = "valid"; verdict["reason"] = "Signature verified; file unchanged since signing"
    print(json.dumps(verdict)); sys.exit(0)

if __name__ == "__main__":
    sys.exit(main())
