#!/usr/bin/env python3
"""
Simple verification script for testing - bypasses NumPy issues
"""

import os, sys, json, argparse, time
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Simple certificate verification")
    parser.add_argument("file_path", help="Path to certificate file")
    parser.add_argument("--base-path", default=".", help="Base path for keys and data")
    args = parser.parse_args()
    
    start_time = time.time()
    file_path = args.file_path
    base_path = args.base_path
    
    if not os.path.exists(file_path):
        result = {"status": "error", "message": "File not found"}
        print(json.dumps(result))
        sys.exit(1)
    
    # Determine file type
    file_ext = Path(file_path).suffix.lower()
    is_pdf = file_ext == '.pdf'
    
    try:
        # For now, return a mock successful result for testing
        if is_pdf:
            # Mock signature verification result
            result = {
                "status": "valid",
                "message": "Certificate verified successfully (mock result)",
                "data": {
                    "stored_signed_hash": "f40f5e577780efa986721219edddeb132db3c5db42aea459a8638f16e76dd4b2",
                    "current_hash": "660fa6ee426b6fa7c624015f5946405c29c4361488e1d07b5965134517ed1644",
                    "hash_algo": "SHA256",
                    "sig_alg": "RSA-PSS",
                    "pubkey_fingerprint_pdf": "2d068549ec4832546fbe3f65f5f02611fef89c98d310875497e0fdb43dadcffd",
                    "signed_present": True,
                    "signature_ok": True,
                    "signed_hash_match": True
                },
                "pipeline": "signature"
            }
        else:
            # Mock QR verification result
            result = {
                "status": "verified",
                "message": "QR and OCR agree on critical fields (mock result)",
                "data": {
                    "fields": {
                        "roll": {
                            "qr": "01110153011",
                            "ocr": "01110153011",
                            "match": True,
                            "struct_ok": True
                        },
                        "name": {
                            "qr": "Simran Kaur",
                            "ocr": "Simran Kaur",
                            "match": True
                        },
                        "university": {
                            "qr": "Ranchi University",
                            "ocr": "Ranchi University",
                            "match": True
                        },
                        "degreeTitle": {
                            "qr": "Bachelor of Engineering",
                            "ocr": "BACHELOR OF ENGINEERING",
                            "match": True
                        },
                        "branch": {
                            "qr": "Mechanical Engineering",
                            "ocr": "MECHANICAL ENGINEERING",
                            "match": True
                        },
                        "exam_date": {
                            "qr": "June 2021",
                            "ocr": "JUNE 2021",
                            "match": True
                        }
                    }
                },
                "pipeline": "qr"
            }
        
        # Add metadata
        processing_time = time.time() - start_time
        result['processing_time'] = round(processing_time, 3)
        result['timestamp'] = time.strftime('%Y-%m-%dT%H:%M:%S')
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "status": "error",
            "message": str(e),
            "pipeline": "error",
            "processing_time": time.time() - start_time,
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S')
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()







