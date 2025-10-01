#!/usr/bin/env python3
import os, re, json, sys, argparse, glob
import cv2
import numpy as np
from PIL import Image
import pyzbar.pyzbar as pyzbar
import pytesseract
from rapidfuzz import fuzz
from pytesseract import Output
from pdf2image import convert_from_path

# ---------- QR detection & decode ----------
def decode_qr(image_bgr):
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    decoded = pyzbar.decode(gray)
    for obj in decoded:
        if obj.type == 'QRCODE':
            data = obj.data.decode('utf-8', errors='ignore')
            try:
                payload = json.loads(data)
            except Exception:
                payload = parse_kv_fallback(data)
            return payload, obj
    return None, None  # no QR found

def parse_kv_fallback(s):
    out = {}
    for part in re.split(r'[;,\n]+', s):
        if ':' in part:
            k, v = part.split(':', 1)
        elif '=' in part:
            k, v = part.split('=', 1)
        else:
            continue
        out[k.strip().lower()] = v.strip()
    return out

# ---------- OCR (string + word-level) ----------
def ocr_full_text(image_bgr, psm=6):  # PSM 6 for accurate uniform text blocks
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    config = f'--oem 3 --psm {psm}'
    return pytesseract.image_to_string(pil_img, config=config)

def ocr_data(image_bgr, psm=6):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    config = f'--oem 3 --psm {psm}'
    d = pytesseract.image_to_data(pil_img, output_type=Output.DICT, config=config)
    words = []
    for i, txt in enumerate(d['text']):
        if txt and str(d['conf'][i]).isdigit() and int(d['conf'][i]) >= 60:
            words.append(txt)
    full = ' '.join(words)
    return full, d  # full normalized text plus token metadata

# ---------- regex patterns ----------
ROLL_RE = re.compile(r'\b(?:Reg\.?No\.?|Roll\s*No\.?|Registration|Reg\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]{6,20})', re.IGNORECASE)
ROLL_FALLBACK = re.compile(r'\b(0[0-9]{10,})\b')
NAME_RE_1 = re.compile(r'\bcertify that\s+([A-Z][A-Za-z.\'\- ]{2,60})\b', re.IGNORECASE)
NAME_RE_2 = re.compile(r'\bhereby makes known that\s+([A-Z][A-Za-z.\'\- ]{2,60})\b', re.IGNORECASE)
UNIV_RE = re.compile(r'\b([A-Za-z.\'\- ]{2,50})\s+University\b')

# -------- Text cleaning functions --------
def clean_university_name(s):
    """Remove OCR noise characters from university names"""
    if not s: return s
    # Remove common OCR noise characters at the beginning
    cleaned = re.sub(r'^[a-z]{1,3}\s+', '', s.strip())  # Remove 1-3 lowercase chars at start
    cleaned = re.sub(r'^[^A-Z]+', '', cleaned)  # Remove any non-capital chars at start
    return cleaned.strip()
DEGREE_RE = re.compile(r'\b(Bachelor|Master|Doctor|Diploma)[A-Za-z .\-&]*\b', re.IGNORECASE)
BRANCH_BETWEEN = re.compile(r'\bin\s+([A-Z][A-Za-z &/]+?)(?=\s+(?:under|within|department|faculty|,|\.))', re.IGNORECASE)
BRANCH_LABELED = re.compile(r'\bbranch\s*[:\-]\s*([A-Za-z &/]{2,60})', re.IGNORECASE)
EXAM_DATE_RE = re.compile(r'\b(?:exam(?:ination)?\s*date|held\s+in)\s*[:\-]?\s*([A-Za-z]+\s+\d{4})', re.IGNORECASE)
GENERIC_DATE_RE = re.compile(r'\b([A-Za-z]+\s+\d{4})\b')

# ---------- post-trim cleaners ----------
def clean_name(s):
    if not s: return s
    s = re.sub(r'\s+has been admitted.*$', '', s, flags=re.IGNORECASE)
    return s.strip()

def clean_university(s):
    if not s: return s
    # keep only the phrase ending with University (trim any leading noise)
    m = re.search(r'([A-Z][A-Za-z.\'\- ]{1,60}\s+University)\b', s)
    return m.group(1).strip() if m else s.strip()

def clean_degree(s):
    if not s: return s
    # capture exactly "<Degree> of <Word{2-40}>" and stop
    m = re.search(r'\b(Bachelor|Master|Doctor|Diploma)\s+of\s+[A-Za-z]{2,40}\b', s, re.IGNORECASE)
    if m:
        return m.group(0).strip()
    # fallback: generic degree start
    m2 = re.search(r'\b(Bachelor|Master|Doctor|Diploma)[A-Za-z .\-&]*\b', s, re.IGNORECASE)
    return m2.group(0).strip() if m2 else s.strip()



# ---------- field extraction ----------
def extract_fields_from_ocr(text):
    clean = ' '.join(text.split())
    f = {}
    m = ROLL_RE.search(clean) or ROLL_FALLBACK.search(clean)
    if m: f['roll'] = m.group(1)
    m = re.search(r'\bname\s*[:\-]\s*([A-Za-z.\'\- ]{2,60})', clean, re.IGNORECASE)
    if m: f['name'] = m.group(1).strip()
    else:
        m = NAME_RE_1.search(clean) or NAME_RE_2.search(clean)
        if m: f['name'] = m.group(1).strip()
    m = UNIV_RE.search(clean)
    if m: f['university'] = clean_university_name(m.group(0))
    m = DEGREE_RE.search(clean)
    if m: f['degreeTitle'] = m.group(0).strip()
    m = BRANCH_BETWEEN.search(clean) or BRANCH_LABELED.search(clean)
    if m: f['branch'] = m.group(1).strip()
    m = EXAM_DATE_RE.search(clean) or GENERIC_DATE_RE.search(clean)
    if m: f['exam_date'] = m.group(1).strip()

    # post-trim cleanup
    if 'name' in f: f['name'] = clean_name(f['name'])
    if 'university' in f: f['university'] = clean_university(f['university'])
    if 'degreeTitle' in f: f['degreeTitle'] = clean_degree(f['degreeTitle'])
    return f

# ---------- comparison ----------
def norm(s):
    return re.sub(r'\s+', ' ', s).strip().lower()

def agree(qr_val, ocr_val, thresh=90):
    if not qr_val or not ocr_val:
        return False
    if norm(qr_val) == norm(ocr_val):
        return True
    score = fuzz.token_set_ratio(qr_val, ocr_val)
    return score >= thresh

def agree_relaxed(qr_val, ocr_val, thresh=85):
    if not qr_val or not ocr_val:
        return False
    if norm(qr_val) == norm(ocr_val):
        return True
    score = fuzz.partial_token_set_ratio(qr_val, ocr_val)
    return score >= thresh

def validate_structural(value, pattern):
    return re.fullmatch(pattern, value or '') is not None

ROLL_PATTERN = r'[0-9A-Za-z\/\-]{6,20}'

def compare_fields(qr_dict, ocr_fields):
    results = {}
    checks = ['roll','name','university','degreeTitle','branch','exam_date']
    for k in checks:
        qv = (qr_dict or {}).get(k) or (qr_dict or {}).get(k.lower())
        ov = ocr_fields.get(k)
        match = agree_relaxed(qv, ov, 85) if k in ('degreeTitle','branch') else agree(qv, ov, 90)
        results[k] = {'qr': qv, 'ocr': ov, 'match': match}
    if results.get('roll','') and (results['roll']['qr'] or results['roll']['ocr']):
        candidate = results['roll']['qr'] or results['roll']['ocr']
        results['roll']['struct_ok'] = validate_structural(candidate, ROLL_PATTERN)
    return results

def overall_decision(results):
    critical = ['roll','name','degreeTitle','university','branch']
    present = [k for k in critical if results.get(k) and (results[k]['qr'] and results[k]['ocr'])]
    if not present:
        return 'insufficient', 'Critical fields missing on either QR or OCR'
    mismatches = [k for k in present if not results[k]['match']]
    if mismatches:
        return 'mismatch', f'Fields disagree: {", ".join(mismatches)}'
    if 'roll' in results and 'struct_ok' in results['roll'] and not results['roll']['struct_ok']:
        return 'mismatch', 'Roll format invalid'
    return 'verified', 'QR and OCR agree on critical fields'

# ---------- PDF rasterization ----------
def pdf_first_page_to_bgr(path_pdf, dpi=300, poppler_path=None):
    pages = convert_from_path(path_pdf, dpi=dpi, poppler_path=poppler_path)
    if not pages:
        return None
    pil = pages[0].convert("RGB")
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

# ---------- end-to-end ----------
def verify_any(path, poppler_path=None):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        img = pdf_first_page_to_bgr(path, dpi=300, poppler_path=poppler_path)
        if img is None:
            return {'status':'error','msg':'failed to rasterize pdf', 'path': path}
    else:
        img = cv2.imread(path)
        if img is None:
            return {'status':'error','msg':'failed to read image', 'path': path}

    # QR first
    qr_data, qr_obj = decode_qr(img)
    if not qr_data:
        return {'status':'no_qr','msg':'no QR detected', 'path': path}

    # OCR and field extraction
    full_text, _ = ocr_data(img, psm=6)  # PSM 6 for accurate text extraction
    ocr_fields = extract_fields_from_ocr(full_text)

    # Compare
    results = compare_fields(qr_data, ocr_fields)
    status, msg = overall_decision(results)
    return {
        'status': status,
        'message': msg,
        'fields': results,
        'qr_bbox': getattr(qr_obj, 'rect', None),
        'path': path
    }

# ---------- CLI ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="image/pdf path or directory")
    ap.add_argument("--glob", default="*.png,*.jpg,*.jpeg,*.tif,*.tiff,*.pdf",
                    help="patterns for dir mode")
    ap.add_argument("--poppler", default=None, help="poppler bin path if not on PATH")
    args = ap.parse_args()

    if os.path.isdir(args.input):
        patterns = [p.strip() for p in args.glob.split(",")]
        paths = []
        for p in patterns:
            paths.extend(glob.glob(os.path.join(args.input, p)))
        if not paths:
            print(json.dumps({"status":"error","msg":"no files matched","dir":args.input}, indent=2))
            return
        results = []
        for path in sorted(paths):
            res = verify_any(path, poppler_path=args.poppler)
            print(json.dumps(res, ensure_ascii=False))
            results.append(res)
        with open("verify_results.json","w",encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
    else:
        res = verify_any(args.input, poppler_path=args.poppler)
        print(json.dumps(res, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
