import hashlib
import sys

def hash_pdf(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath,"rb") as f:
        for byte_block in iter(lambda: f.read(4096),b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

if __name__ == "__main__":
    print(hash_pdf(sys.argv[1]))
