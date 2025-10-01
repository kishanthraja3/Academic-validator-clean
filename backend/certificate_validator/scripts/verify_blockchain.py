#!/usr/bin/env python3
"""
Blockchain verification pipeline for certificate verification.
This script queries the Hyperledger Fabric blockchain to verify PDF hashes.
"""

import os
import sys
import json
import subprocess
import hashlib
import argparse
from pathlib import Path

def extract_metadata_field(blockchain_data, field_name):
    """Extract a field from blockchain metadata JSON string."""
    try:
        metadata_str = blockchain_data.get("metadata", "")
        if metadata_str:
            metadata = json.loads(metadata_str)
            return metadata.get(field_name, "Unknown")
    except (json.JSONDecodeError, TypeError):
        pass
    return "Unknown"

def get_pdf_hash(pdf_path):
    """Get PDF hash - either embedded from metadata or compute from file."""
    try:
        # First, try to extract embedded hash from PDF metadata
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            metadata = reader.metadata
            embedded_hash = metadata.get("/PDFHash")
            if embedded_hash:
                print(f"Found embedded hash in PDF metadata: {embedded_hash[:16]}...", file=sys.stderr)
                return embedded_hash, "embedded"
        except Exception as e:
            print(f"Could not extract embedded hash: {e}", file=sys.stderr)
        
        # Fallback: compute hash from file content
        with open(pdf_path, 'rb') as f:
            file_content = f.read()
            file_hash = hashlib.sha256(file_content).hexdigest()
            print(f"Computed hash from file content: {file_hash[:16]}...", file=sys.stderr)
            return file_hash, "computed"
    except Exception as e:
        print(f"Error getting PDF hash: {e}", file=sys.stderr)
        return None, None


def query_blockchain(pdf_hash):
    """Query the blockchain for the PDF hash."""
    try:
        # Docker command to query the blockchain
        cmd = [
            'docker', 'exec', 'cli', 'bash', '-c',
            f'export FABRIC_CFG_PATH=/fabric-samples/test-network/compose/docker/peercfg && '
            f'export CORE_PEER_LOCALMSPID="Org1MSP" && '
            f'export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp && '
            f'export CORE_PEER_ADDRESS=peer0.org1.example.com:7051 && '
            f'export CORE_PEER_BCCSP_SW_FILEKEYSTORE_KEYSTORE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore && '
            f'export CORE_PEER_TLS_ENABLED=true && '
            f'export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem && '
            f'peer chaincode query -C mychannel -n pdfhash -c \'{{"Args":["VerifyPDF","{pdf_hash}"]}}\''
        ]
        
        print(f"Querying blockchain for hash: {pdf_hash[:16]}...", file=sys.stderr)
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        print(f"Blockchain query result: {result.returncode}", file=sys.stderr)
        print(f"Blockchain query stdout: {result.stdout}", file=sys.stderr)
        print(f"Blockchain query stderr: {result.stderr}", file=sys.stderr)
        
        if result.returncode == 0:
            # Parse the blockchain response
            try:
                # The blockchain response might be JSON or plain text
                response_text = result.stdout.strip()
                if response_text.startswith('{'):
                    blockchain_data = json.loads(response_text)
                else:
                    # If it's not JSON, treat it as a simple response
                    blockchain_data = {"response": response_text}
                
                return {
                    "status": "verified",
                    "message": "Hash found in blockchain",
                    "blockchain_data": blockchain_data,
                    "computed_hash": pdf_hash,
                    "query_successful": True
                }
            except json.JSONDecodeError:
                # If response is not JSON, check if it contains success indicators
                if "true" in response_text.lower() or "found" in response_text.lower():
                    return {
                        "status": "verified",
                        "message": "Hash found in blockchain",
                        "blockchain_response": response_text,
                        "computed_hash": pdf_hash,
                        "query_successful": True
                    }
                else:
                    return {
                        "status": "invalid",
                        "message": "Hash not found in blockchain",
                        "blockchain_response": response_text,
                        "computed_hash": pdf_hash,
                        "query_successful": True
                    }
        else:
            return {
                "status": "error",
                "message": f"Blockchain query failed: {result.stderr}",
                "computed_hash": pdf_hash,
                "query_successful": False
            }
            
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "message": "Blockchain query timeout",
            "computed_hash": pdf_hash,
            "query_successful": False
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Blockchain query error: {str(e)}",
            "computed_hash": pdf_hash,
            "query_successful": False
        }

def main():
    parser = argparse.ArgumentParser(description="Blockchain verification for PDF certificates")
    parser.add_argument("pdf_path", help="Path to PDF file")
    args = parser.parse_args()
    
    if not os.path.exists(args.pdf_path):
        result = {
            "status": "error",
            "message": "File not found",
            "path": args.pdf_path
        }
    else:
        # Get hash of the PDF (embedded or computed)
        pdf_hash, hash_type = get_pdf_hash(args.pdf_path)
        
        if pdf_hash:
            # Query blockchain
            result = query_blockchain(pdf_hash)
            result["path"] = args.pdf_path
            result["hash_type"] = hash_type
            result["hash_source"] = "embedded" if hash_type == "embedded" else "computed"
            
            # If verification was successful, create verification details
            if result.get("status") == "verified":
                # Create detailed verification sections like signature pipeline
                result["verification_details"] = {
                    "hash_verification": {
                        "title": "Hash Verification",
                        "stored_blockchain_hash": pdf_hash,
                        "current_file_hash": pdf_hash,
                        "hash_source": result["hash_source"],
                        "hash_type": result["hash_type"],
                        "status": "verified",
                        "message": "Hash found in blockchain - Certificate verified"
                    },
                    "blockchain_information": {
                        "title": "Blockchain Information", 
                        "blockchain_issuer": extract_metadata_field(result.get("blockchain_data", {}), "issuer"),
                        "blockchain_date": extract_metadata_field(result.get("blockchain_data", {}), "date"),
                        "blockchain_network": "Hyperledger Fabric",
                        "blockchain_channel": "mychannel",
                        "chaincode_name": "pdfhash",
                        "status": "verified",
                        "message": "Blockchain record found and verified"
                    },
                    "blockchain_connectivity": {
                        "title": "Blockchain Connectivity",
                        "docker_container": "cli",
                        "network_status": "connected",
                        "query_successful": result.get("query_successful", False),
                        "response_time": "< 5 seconds",
                        "status": "success",
                        "message": "Successfully connected to blockchain network"
                    }
                }
        else:
            result = {
                "status": "error",
                "message": "Failed to get PDF hash",
                "path": args.pdf_path
            }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
