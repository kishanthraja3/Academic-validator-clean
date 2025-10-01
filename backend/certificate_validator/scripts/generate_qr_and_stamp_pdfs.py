# scripts/generate_qr_and_stamp_pdfs.py
# pip install reportlab PyPDF2 "qrcode[pil]" pillow
import io, json, os, glob, sys
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from PIL import Image
import qrcode

IN_DIR = "cert_pdfs"          # input PDFs (e.g., certificate_01110153001.pdf)
OUT_DIR = "qr_pdf_output"     # output PDFs named {roll}.pdf

# QR appearance and placement defaults (in points)
QR_SIZE_PT = 140              # ~1.94 inches; adjust 120–160 as needed
BASE_ANCHOR = "bottom_right"  # bottom_right | bottom_left | top_right | top_left
BASE_MARGIN_PT = 35*mm        # distance from anchored edges (~35 mm)
DELTA_LEFT_PT = 0         # + moves left (~12 mm); set 0 for none
DELTA_UP_PT = 80            # + moves up (~7 mm)

def make_qr_pil(payload: dict, box_px=400):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2
    )
    qr.add_data(json.dumps(payload, ensure_ascii=False))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return img.resize((box_px, box_px), Image.Resampling.LANCZOS)

def overlay_qr_on_pdf(input_pdf, output_pdf, qr_img_pil,
                      qr_size_pt=QR_SIZE_PT,
                      base_anchor=BASE_ANCHOR,
                      base_margin_pt=BASE_MARGIN_PT,
                      delta_left_pt=DELTA_LEFT_PT,
                      delta_up_pt=DELTA_UP_PT):
    with open(input_pdf, "rb") as fin:
        reader = PdfReader(fin)
        writer = PdfWriter()

        page = reader.pages[0]
        W = float(page.mediabox.width)
        H = float(page.mediabox.height)

        # Prepare QR as image for ReportLab
        buf = io.BytesIO()
        qr_img_pil.save(buf, format="PNG")
        buf.seek(0)
        qr_img = ImageReader(buf)

        # Build overlay
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(W, H))

        m = base_margin_pt
        if base_anchor == "bottom_right":
            x = W - qr_size_pt - m
            y = m
        elif base_anchor == "bottom_left":
            x = m
            y = m
        elif base_anchor == "top_right":
            x = W - qr_size_pt - m
            y = H - qr_size_pt - m
        else:  # top_left
            x = m
            y = H - qr_size_pt - m

        # Fine nudges
        x = x - float(delta_left_pt)  # positive moves left
        y = y + float(delta_up_pt)    # positive moves up

        can.drawImage(qr_img, x, y, width=qr_size_pt, height=qr_size_pt,
                      preserveAspectRatio=True, mask='auto')
        can.save()
        packet.seek(0)

        overlay_reader = PdfReader(packet)
        page.merge_page(overlay_reader.pages[0])
        writer.add_page(page)

        # Copy remaining pages if present
        for i in range(1, len(reader.pages)):
            writer.add_page(reader.pages[i])

        os.makedirs(os.path.dirname(output_pdf), exist_ok=True)
        with open(output_pdf, "wb") as fout:
            writer.write(fout)

def find_pdf_for_roll(roll: str) -> str | None:
    # Accepts "{roll}.pdf" or any "*{roll}.pdf" like "certificate_{roll}.pdf"
    direct = os.path.join(IN_DIR, f"{roll}.pdf")
    if os.path.exists(direct):
        return direct
    matches = glob.glob(os.path.join(IN_DIR, f"*{roll}.pdf"))
    return matches[0] if matches else None

def main():
    print(f"CWD: {os.path.abspath(os.getcwd())}")
    print(f"Input dir:  {os.path.abspath(IN_DIR)}")
    print(f"Output dir: {os.path.abspath(OUT_DIR)}")

    # Look for students.json in the certificate_validator directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    students_json_path = os.path.join(script_dir, "..", "students.json")
    students_json_path = os.path.abspath(students_json_path)  # Resolve the path properly
    
    # If not found, try looking in the current working directory
    if not os.path.exists(students_json_path):
        students_json_path = "students.json"
        if not os.path.exists(students_json_path):
            print(f"students.json not found at: {os.path.join(script_dir, '..', 'students.json')} or in current directory", file=sys.stderr)
            sys.exit(1)
    
    print(f"Using students.json at: {os.path.abspath(students_json_path)}")

    with open(students_json_path, "r", encoding="utf-8") as f:
        students = json.load(f)
    print(f"Loaded {len(students)} records")

    os.makedirs(OUT_DIR, exist_ok=True)
    hits = misses = 0
    for s in students:
        roll = s["roll"]
        in_pdf = find_pdf_for_roll(roll)
        if not in_pdf:
            print(f"[MISS] No PDF for roll {roll}")
            misses += 1
            continue

        payload = {

        "roll": s["roll"],
        "name": s["name"],
        "university": s["university"],
        "degreeTitle": s["degreeTitle"],
        "branch": s["branch"],              # NEW
        "exam_date": s["exam_date"]         # CHANGED: was footer_date

        }

        qr_img_pil = make_qr_pil(payload, box_px=400)
        out_pdf = os.path.join(OUT_DIR, f"{roll}.pdf")
        try:
            overlay_qr_on_pdf(
                in_pdf, out_pdf, qr_img_pil,
                qr_size_pt=QR_SIZE_PT,
                base_anchor=BASE_ANCHOR,
                base_margin_pt=BASE_MARGIN_PT,
                delta_left_pt=DELTA_LEFT_PT,
                delta_up_pt=DELTA_UP_PT
            )
            print(f"[OK]   {os.path.basename(in_pdf)} -> {os.path.basename(out_pdf)}")
            hits += 1
        except Exception as e:
            print(f"[ERR]  {os.path.basename(in_pdf)} -> {e}", file=sys.stderr)

    print(f"Done. Hits={hits} Misses={misses}")

if __name__ == "__main__":
    main()
