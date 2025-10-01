#!/usr/bin/env python3
import argparse, sys
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives import serialization, hashes
import hashlib

def gen_rsa(priv_path: Path, pub_path: Path):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    )
    pub = key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    priv_path.write_bytes(priv)
    pub_path.write_bytes(pub)

def gen_ec_p256(priv_path: Path, pub_path: Path):
    key = ec.generate_private_key(ec.SECP256R1())
    priv = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    )
    pub = key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    priv_path.write_bytes(priv)
    pub_path.write_bytes(pub)

def fingerprint(pub_path: Path):
    from cryptography.hazmat.primitives import serialization
    data = pub_path.read_bytes()
    pub = serialization.load_pem_public_key(data)
    der = pub.public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    print(hashlib.sha256(der).hexdigest())

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    genrsa = sub.add_parser("gen-rsa")
    genrsa.add_argument("--private", required=True, type=Path)
    genrsa.add_argument("--public", required=True, type=Path)
    genec = sub.add_parser("gen-ec-p256")
    genec.add_argument("--private", required=True, type=Path)
    genec.add_argument("--public", required=True, type=Path)
    fp = sub.add_parser("fingerprint")
    fp.add_argument("--public", required=True, type=Path)
    args = ap.parse_args()

    if args.cmd == "gen-rsa":
        gen_rsa(args.private, args.public)
    elif args.cmd == "gen-ec-p256":
        gen_ec_p256(args.private, args.public)
    elif args.cmd == "fingerprint":
        fingerprint(args.public)
    else:
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
