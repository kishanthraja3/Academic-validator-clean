#!/usr/bin/env python3
"""
Unified certificate verification script that efficiently determines and runs the appropriate pipeline.
This script optimizes performance by:
1. Quick metadata check for PDFs
2. Parallel processing where possible
3. Early exit strategies
4. Optimized resource usage
"""

import os, sys, json, argparse, time, subprocess, glob
from pathlib import Path

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def detect_available_verification_methods(pdf_path, base_path=None):
    """Detect all available verification methods for a PDF."""
    available_methods = {
        'blockchain': False,
        'signature': False,
        'qr': False,
        'legacy': True  # Legacy is always available as fallback
    }
    
    try:
        # 1. Check for blockchain verification
        print("Checking for blockchain verification...", file=sys.stderr)
        blockchain_available, blockchain_hash = check_blockchain_availability(pdf_path)
        available_methods['blockchain'] = blockchain_available
        if blockchain_available:
            print(f"✓ Blockchain verification available (hash: {blockchain_hash[:16]}...)", file=sys.stderr)
        else:
            print("✗ Blockchain verification not available", file=sys.stderr)
        
        # 2. Check for signature verification
        print("Checking for signature verification...", file=sys.stderr)
        signature_available = check_signature_availability(pdf_path, base_path)
        available_methods['signature'] = signature_available
        if signature_available:
            print("✓ Signature verification available", file=sys.stderr)
        else:
            print("✗ Signature verification not available", file=sys.stderr)
        
        # 3. Check for QR code verification
        print("Checking for QR code verification...", file=sys.stderr)
        qr_available = check_qr_availability(pdf_path)
        available_methods['qr'] = qr_available
        if qr_available:
            print("✓ QR code verification available", file=sys.stderr)
        else:
            print("✗ QR code verification not available", file=sys.stderr)
        
        return available_methods
        
    except Exception as e:
        print(f"Error detecting verification methods: {e}", file=sys.stderr)
        return available_methods

def check_blockchain_availability(pdf_path):
    """Check if blockchain verification is available for this PDF."""
    try:
        # Only check for blockchain verification if the PDF has an embedded hash
        # Don't check for computed hashes - only embedded hashes should trigger blockchain verification
        import hashlib
        
        # First, try to extract embedded hash from PDF metadata
        file_hash = None
        hash_source = "computed"
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            metadata = reader.metadata
            embedded_hash = metadata.get("/PDFHash")
            if embedded_hash:
                file_hash = embedded_hash
                hash_source = "embedded"
                print(f"Found embedded hash in PDF: {embedded_hash[:16]}...", file=sys.stderr)
            else:
                print(f"No embedded hash found in PDF: {pdf_path}", file=sys.stderr)
                return False, None
        except Exception as e:
            print(f"Error reading PDF metadata: {e}", file=sys.stderr)
            return False, None
        
        # Only proceed if we found an embedded hash
        if hash_source != "embedded":
            print(f"No embedded hash found, skipping blockchain verification", file=sys.stderr)
            return False, None
        
        # Quick blockchain query with short timeout
        cmd = [
            'docker', 'exec', 'cli', 'bash', '-c',
            f'export FABRIC_CFG_PATH=/fabric-samples/test-network/compose/docker/peercfg && '
            f'export CORE_PEER_LOCALMSPID="Org1MSP" && '
            f'export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp && '
            f'export CORE_PEER_ADDRESS=peer0.org1.example.com:7051 && '
            f'export CORE_PEER_BCCSP_SW_FILEKEYSTORE_KEYSTORE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore && '
            f'export CORE_PEER_TLS_ENABLED=true && '
            f'export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem && '
            f'peer chaincode query -C mychannel -n pdfhash -c \'{{"Args":["VerifyPDF","{file_hash}"]}}\''
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
        
        print(f"Blockchain query return code: {result.returncode}", file=sys.stderr)
        print(f"Blockchain query stdout: {result.stdout}", file=sys.stderr)
        print(f"Blockchain query stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0 and result.stdout.strip():
            return True, file_hash
        else:
            # If blockchain query fails due to configuration issues, 
            # we can still proceed with blockchain verification as a fallback
            print(f"Blockchain query failed, but embedded hash found: {file_hash[:16]}...", file=sys.stderr)
            return False, file_hash
            
    except Exception as e:
        return False, None

def check_signature_availability(pdf_path, base_path=None):
    """Check if signature verification is available for this PDF."""
    try:
        # First check for sidecar signature file
        sidecar_path = pdf_path + '.sig.json'
        if os.path.exists(sidecar_path):
            return True
        
        # Skip signed directory check - not needed for basic signature verification
        # The signed directory is only needed for storing signature files, not for verification
        
        # Check for embedded signature metadata
        try:
            import pikepdf
            with pikepdf.open(pdf_path) as pdf:
                # Check for signature in metadata
                if pdf.docinfo and any(key.startswith('/pdfsig:') for key in pdf.docinfo.keys()):
                    return True
                
                # Check for signature attachments
                if hasattr(pdf, 'attachments') and pdf.attachments:
                    for name, attachment in pdf.attachments.items():
                        if 'signature' in name.lower():
                            return True
        except Exception as e:
            pass
        
        return False
        
    except Exception as e:
        return False

def check_qr_availability(pdf_path):
    """Check if QR code verification is available for this PDF."""
    try:
        import cv2
        import numpy as np
        import pytesseract
        from pdf2image import convert_from_path
        from pyzbar import pyzbar
        
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)
        if not images:
            return False
            
        # Check first few pages for QR codes
        for i, img in enumerate(images[:3]):  # Check first 3 pages
            img_array = np.array(img)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # Look for QR codes
            qr_codes = pyzbar.decode(gray)
            if qr_codes:
                return True
        
        return False
        
    except Exception as e:
        return False

def quick_pdf_metadata_check(pdf_path, base_path=None):
    """Quick check for PDF metadata without full signature verification."""
    try:
        # First check for sidecar signature file (our system uses sidecar files)
        sidecar_path = pdf_path + '.sig.json'
        if os.path.exists(sidecar_path):
            print(f"Found sidecar signature file: {sidecar_path}", file=sys.stderr)
            return True
        
        # Skip signed directory check - not needed for basic signature verification
        # The signed directory is only needed for storing signature files, not for verification
        
        # Fallback: Check for embedded signature metadata in PDF
        import pikepdf
        with pikepdf.Pdf.open(pdf_path) as pdf:
            # Check for actual digital signature metadata, not just any metadata
            print(f"Checking PDF metadata for signatures: {pdf_path}", file=sys.stderr)
            
            # Check for signature-specific metadata in docinfo
            if pdf.docinfo:
                signed_meta = pdf.docinfo.get("/SignedMetaJSON")
                signature = pdf.docinfo.get("/Signature")
                if signed_meta or signature:
                    print(f"Found signature metadata in docinfo: {signed_meta or signature}", file=sys.stderr)
                    return True
            
            # Check for signature objects in the PDF
            if "/AcroForm" in pdf.Root and pdf.Root.AcroForm:
                acroform = pdf.Root.AcroForm
                if "/SigFlags" in acroform and acroform.SigFlags > 0:
                    print(f"Found SigFlags: {acroform.SigFlags}", file=sys.stderr)
                    return True
                
                # Check for signature fields
                if "/Fields" in acroform:
                    for field in acroform.Fields:
                        if field.get("/FT") == "/Sig":
                            print("Found signature field", file=sys.stderr)
                            return True
            
            # Check for signature objects in the PDF catalog
            if "/DSS" in pdf.Root:
                print("Found DSS (Document Security Store)", file=sys.stderr)
                return True
            
            # Check for signature objects in the PDF trailer
            if hasattr(pdf, 'trailer') and pdf.trailer:
                if "/Root" in pdf.trailer:
                    root = pdf.trailer["/Root"]
                    if "/AcroForm" in root and root["/AcroForm"]:
                        acroform = root["/AcroForm"]
                        if "/SigFlags" in acroform and acroform["/SigFlags"] > 0:
                            print(f"Found SigFlags in trailer: {acroform['/SigFlags']}", file=sys.stderr)
                            return True
            
            # If pikepdf doesn't detect it, try a quick signature verification check
            print("Pikepdf didn't detect signature, trying quick signature check", file=sys.stderr)
            try:
                # Use base_path if provided, otherwise try to construct it
                if base_path:
                    public_key_path = os.path.join(base_path, 'keys', 'pub.pem')
                else:
                    public_key_path = os.path.join(os.path.dirname(pdf_path), '..', 'keys', 'pub.pem')
                
                result = subprocess.run([
                    sys.executable,
                    os.path.join(os.path.dirname(__file__), 'verify_signature.py'),
                    '--pdf-path', pdf_path,
                    '--public-key', public_key_path
                ], capture_output=True, text=True, timeout=5)
                
                if result.returncode == 0 or result.returncode == 1:  # 0 = valid, 1 = invalid but signed
                    try:
                        sig_result = json.loads(result.stdout)
                        # Only return true if there's actually a VALID signature with stored hash
                        if (sig_result.get('signed_present', False) and 
                            sig_result.get('stored_signed_hash') is not None and
                            sig_result.get('status') == 'valid'):
                            print(f"Quick signature check found VALID signature: {sig_result.get('status')}", file=sys.stderr)
                            return True
                        else:
                            print(f"Quick signature check found signature but not valid: {sig_result.get('status')}", file=sys.stderr)
                            return False
                    except:
                        pass
            except:
                pass
            
            print("No signature metadata found", file=sys.stderr)
            return False
    except Exception as e:
        print(f"Error checking PDF metadata: {e}", file=sys.stderr)
        return False

def run_signature_verification(pdf_path, base_path, original_hash=None):
    """Run signature verification pipeline."""
    try:
        print(f"Running signature verification for: {pdf_path}", file=sys.stderr)
        
        # Debug: Check if file exists and get its size
        if os.path.exists(pdf_path):
            file_size = os.path.getsize(pdf_path)
            print(f"File exists, size: {file_size} bytes", file=sys.stderr)
            
            # Calculate file hash for verification
            import hashlib
            with open(pdf_path, 'rb') as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
            print(f"File SHA256 hash: {file_hash[:16]}...", file=sys.stderr)
            
            # For signature verification, always use the computed hash of the signed file
            # Don't override with original_hash as it causes hash mismatch issues
        else:
            print(f"ERROR: File does not exist: {pdf_path}", file=sys.stderr)
            return {"status": "error", "message": "File not found"}
        
        from verify_signature import main as sig_main
        import tempfile
        
        # Use subprocess for better control and timeout
        public_key = os.path.join(base_path, 'keys', 'pub.pem')
        if not os.path.exists(public_key):
            print(f"Public key not found at: {public_key}", file=sys.stderr)
            return {"status": "error", "message": "Public key not found"}
        
        print(f"Using public key: {public_key}", file=sys.stderr)
        
        # Build command with original hash if provided
        cmd = [
            sys.executable, 
            os.path.join(os.path.dirname(__file__), 'verify_signature.py'),
            '--pdf-path', pdf_path,
            '--public-key', public_key
        ]
        
        # Don't pass original_hash for signature verification
        # The signature verification script should compute the hash of the signed file itself
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        print(f"Signature verification result: {result.returncode}", file=sys.stderr)
        print(f"Signature verification stdout: {result.stdout}", file=sys.stderr)
        print(f"Signature verification stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return json.loads(result.stdout) if result.stdout else {"status": "error", "message": result.stderr}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Signature verification timeout"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_qr_verification(file_path):
    """Run QR verification pipeline."""
    try:
        print(f"Running QR verification for: {file_path}", file=sys.stderr)
        
        result = subprocess.run([
            sys.executable,
            os.path.join(os.path.dirname(__file__), 'verify_certificate_image.py'),
            file_path
        ], capture_output=True, text=True, timeout=20)
        
        print(f"QR verification result: {result.returncode}", file=sys.stderr)
        print(f"QR verification stdout: {result.stdout}", file=sys.stderr)
        print(f"QR verification stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return json.loads(result.stdout) if result.stdout else {"status": "error", "message": result.stderr}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "QR verification timeout"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_legacy_verification(file_path, base_path):
    """Run legacy verification pipeline."""
    try:
        print(f"Running legacy verification for: {file_path}", file=sys.stderr)
        
        # Check if CSV exists for fallback
        csv_path = os.path.join(base_path, 'data', 'certificates_legacy.csv')
        csv_exists = os.path.exists(csv_path)
        
        if csv_exists:
            print(f"CSV fallback available at: {csv_path}", file=sys.stderr)
        else:
            print("No CSV fallback available, using MySQL only", file=sys.stderr)
        
        # Build command - use MySQL by default, CSV as fallback
        cmd = [
            sys.executable,
            os.path.join(os.path.dirname(__file__), 'verify_legacy.py'),
            file_path
        ]
        
        # Only add CSV flag if we want to force CSV usage
        # (remove this line to use MySQL by default)
        # cmd.extend(['--csv', csv_path])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=25)
        
        print(f"Legacy verification result: {result.returncode}", file=sys.stderr)
        print(f"Legacy verification stdout: {result.stdout}", file=sys.stderr)
        print(f"Legacy verification stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return json.loads(result.stdout) if result.stdout else {"status": "error", "message": result.stderr}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Legacy verification timeout"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_blockchain_verification(file_path):
    """Run blockchain verification pipeline."""
    try:
        print(f"Running blockchain verification for: {file_path}", file=sys.stderr)
        
        result = subprocess.run([
            sys.executable,
            os.path.join(os.path.dirname(__file__), 'verify_blockchain.py'),
            file_path
        ], capture_output=True, text=True, timeout=30)
        
        print(f"Blockchain verification result: {result.returncode}", file=sys.stderr)
        print(f"Blockchain verification stdout: {result.stdout}", file=sys.stderr)
        print(f"Blockchain verification stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return json.loads(result.stdout) if result.stdout else {"status": "error", "message": result.stderr}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Blockchain verification timeout"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Unified certificate verification")
    parser.add_argument("file_path", help="Path to certificate file")
    parser.add_argument("--base-path", default=".", help="Base path for keys and data")
    parser.add_argument("--force-pipeline", choices=['signature', 'qr', 'legacy', 'blockchain'], 
                       help="Force specific pipeline (for testing)")
    parser.add_argument("--original-hash", help="Original file hash for signature verification")
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
        if args.force_pipeline:
            # Force specific pipeline for testing
            if args.force_pipeline == 'signature':
                result = run_signature_verification(file_path, base_path)
                pipeline = 'signature'
            elif args.force_pipeline == 'qr':
                result = run_qr_verification(file_path)
                pipeline = 'qr'
            elif args.force_pipeline == 'legacy':
                result = run_legacy_verification(file_path, base_path)
                pipeline = 'legacy'
            elif args.force_pipeline == 'blockchain':
                result = run_blockchain_verification(file_path)
                pipeline = 'blockchain'
        else:
            # Automatic pipeline selection with proper detection
            if is_pdf:
                # For PDFs, detect all available verification methods
                print("Detecting available verification methods...", file=sys.stderr)
                available_methods = detect_available_verification_methods(file_path, base_path)
                
                print(f"Available methods: {available_methods}", file=sys.stderr)
                
                # Route based on priority and availability
                if available_methods['blockchain']:
                    print("Using blockchain pipeline (highest priority)", file=sys.stderr)
                    result = run_blockchain_verification(file_path)
                    pipeline = 'blockchain'
                elif available_methods['signature']:
                    print("Using signature pipeline", file=sys.stderr)
                    result = run_signature_verification(file_path, base_path, args.original_hash)
                    pipeline = 'signature'
                elif available_methods['qr']:
                    print("Using QR pipeline", file=sys.stderr)
                    result = run_qr_verification(file_path)
                    pipeline = 'qr'
                    
                    # If QR fails, use legacy as final fallback
                    if result.get('status') in ['no_qr', 'error']:
                        print("QR pipeline failed, using legacy pipeline", file=sys.stderr)
                        result = run_legacy_verification(file_path, base_path)
                        pipeline = 'legacy'
                else:
                    # No specific verification method available, use legacy
                    print("No specific verification method available, using legacy pipeline", file=sys.stderr)
                    result = run_legacy_verification(file_path, base_path)
                    pipeline = 'legacy'
            else:
                # For images, go directly to QR pipeline
                print("Image file, using QR pipeline", file=sys.stderr)
                result = run_qr_verification(file_path)
                pipeline = 'qr'
                
                # If QR fails, try blockchain
                if result.get('status') in ['no_qr', 'error']:
                    print("QR pipeline failed for image, trying blockchain pipeline", file=sys.stderr)
                    result = run_blockchain_verification(file_path)
                    pipeline = 'blockchain'
                    
                    # If blockchain fails, use legacy as final fallback
                    if result.get('status') in ['error']:
                        print("Blockchain pipeline failed for image, using legacy pipeline", file=sys.stderr)
                        result = run_legacy_verification(file_path, base_path)
                        pipeline = 'legacy'
        
        # Add metadata
        processing_time = time.time() - start_time
        result['pipeline'] = pipeline
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


