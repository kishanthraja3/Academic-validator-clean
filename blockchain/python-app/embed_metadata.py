from pypdf import PdfReader, PdfWriter
import sys

def embed_metadata(pdf_path, output_path, pdf_hash, extra_metadata={}):
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    metadata = {"/PDFHash": pdf_hash}
    metadata.update(extra_metadata)
    writer.add_metadata(metadata)
    with open(output_path, "wb") as f:
        writer.write(f)

if __name__ == "__main__":
    src, dst, hashv = sys.argv[1], sys.argv[2], sys.argv[3]
    embed_metadata(src, dst, hashv)
