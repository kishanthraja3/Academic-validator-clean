import pikepdf
from pathlib import Path
import sys

def has_signature_metadata(pdf_path: Path, signature_key: str = "pdfsig:SignedMetaJSON") -> bool:
    try:
        with pikepdf.Pdf.open(pdf_path) as pdf:
            with pdf.open_metadata() as xmp:
                if signature_key in xmp:
                    return True
            if pdf.docinfo and f"/{signature_key}" in pdf.docinfo:
                return True
    except Exception:
        return False
    return False

def scan_folder_for_signed_pdfs(folder_path: str):
    folder = Path(folder_path)
    results = {}
    for pdf_file in folder.glob("*.pdf"):
        results[pdf_file.name] = has_signature_metadata(pdf_file)
    return results

if __name__ == "__main__":
    folder_path = sys.argv[1] if len(sys.argv) > 1 else "."
    scan_results = scan_folder_for_signed_pdfs(folder_path)
    for filename, has_sig in scan_results.items():
        print(f"{filename}: {'Signed' if has_sig else 'Not signed'}")
