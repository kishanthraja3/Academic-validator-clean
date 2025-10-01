from pypdf import PdfReader
import sys

def extract_hash(pdf_path):
    reader = PdfReader(pdf_path)
    metadata = reader.metadata
    return metadata.get("/PDFHash")

if __name__ == "__main__":
    print(extract_hash(sys.argv[1]))
