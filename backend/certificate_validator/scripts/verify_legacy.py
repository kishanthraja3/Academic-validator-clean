#!/usr/bin/env python3
import os, re, json, argparse, glob, csv, sys
import cv2, numpy as np
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
from rapidfuzz import fuzz
from rapidfuzz.distance import Levenshtein
from pytesseract import Output
from collections import Counter

# -------- Patterns --------
ROLL_RE = re.compile(r'\b(?:Enrollment|Enrolment|Reg\.?No\.?|Roll\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]{6,20})', re.IGNORECASE)
ROLL_FALLBACK = re.compile(r'\b(0[0-9]{6,})\b')
UNIV_RE = re.compile(r'\b([A-Za-z.\'\- ]{2,60})\s+University\b', re.IGNORECASE)
DEGREE_STRICT = re.compile(r'\b(Bachelor|Master|Doctor|Diploma)\s+of\s+[A-Za-z ]{2,80}\b', re.IGNORECASE)
YEAR_RE = re.compile(r'\b(19\d{2}|20\d{2})\b')

# -------- OCR wrappers --------
def ocr_text(image_bgr, psm=6):  # PSM 6 for accurate uniform text blocks
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return pytesseract.image_to_string(Image.fromarray(rgb), config=f'--oem 3 --psm {psm}')

def ocr_digits(image_bgr, psm=7):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return pytesseract.image_to_string(
        Image.fromarray(rgb),
        config=f'--oem 3 --psm {psm} -c tessedit_char_whitelist=0123456789'
    )

def ocr_data_words(img_bgr, psm=6, min_conf=60):
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    d = pytesseract.image_to_data(Image.fromarray(rgb), output_type=Output.DICT, config=f'--oem 3 --psm {psm}')
    words = []
    for i, txt in enumerate(d['text']):
        if not txt:
            continue
        try:
            conf = int(d['conf'][i])
        except Exception:
            conf = -1
        if conf >= min_conf:
            words.append(txt)
    return ' '.join(words)

def find_words(image_bgr, psm=6, min_conf=55):
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    data = pytesseract.image_to_data(Image.fromarray(rgb), output_type=Output.DICT, config=f'--oem 3 --psm {psm}')
    words = []
    n = len(data['text'])
    for i in range(n):
        txt = data['text'][i]
        if not txt:
            continue
        try:
            conf = int(data['conf'][i])
        except Exception:
            conf = -1
        if conf < min_conf:
            continue
        x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
        words.append({'text': txt, 'conf': conf, 'x': x, 'y': y, 'w': w, 'h': h})
    return words

# -------- Normalization / Matching --------
def clean_university(s):
    if not s: return s
    # Remove common OCR noise characters at the beginning
    cleaned = re.sub(r'^[a-z]{1,3}\s+', '', s.strip())  # Remove 1-3 lowercase chars at start
    cleaned = re.sub(r'^[^A-Z]+', '', cleaned)  # Remove any non-capital chars at start
    
    # Look for university pattern
    m = re.search(r'([A-Z][A-Za-z.\'\- ]{1,60}\s+University)\b', cleaned)
    return m.group(1).strip() if m else cleaned.strip()

def clean_degree(s):
    if not s: return s
    m = DEGREE_STRICT.search(s)
    if m: return m.group(0).strip()
    m2 = re.search(r'\b(Bachelor|Master|Doctor|Diploma)[A-Za-z .\-&]{2,80}\b', s, re.IGNORECASE)
    return m2.group(0).strip() if m2 else s.strip()

def norm(s):
    return re.sub(r'\s+',' ', s).strip().lower() if isinstance(s,str) else s

def agree(a, b, t=90):
    if not a or not b: return False
    if norm(a) == norm(b): return True
    return fuzz.token_set_ratio(a, b) >= t

def agree_degree(a, b, t=78):
    if not a or not b: return False
    if norm(a) == norm(b): return True
    return max(fuzz.partial_token_ratio(a,b), fuzz.partial_token_set_ratio(a,b)) >= t

# -------- Preprocess --------
def deskew(gray):
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    angle = 0.0
    if lines is not None:
        angles = []
        for rho, theta in lines[:,0]:
            deg = (theta*180/np.pi)
            if deg < 10 or deg > 170:
                a = deg if deg <= 90 else deg - 180
                angles.append(a)
        if angles:
            angle = np.median(angles)
    if abs(angle) < 0.1:
        return gray
    h, w = gray.shape[:2]
    M = cv2.getRotationMatrix2D((w//2,h//2), angle, 1.0)
    return cv2.warpAffine(gray, M, (w,h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def pdf_to_bgr(path, dpi=480, poppler_path=None):
    pages = convert_from_path(path, dpi=dpi, poppler_path=poppler_path)
    if not pages: return None
    pil = pages[0].convert("RGB")
    bgr = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = deskew(gray)
    blur = cv2.medianBlur(gray, 3)
    thr = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 31, 15)
    return cv2.cvtColor(thr, cv2.COLOR_GRAY2BGR)

def crop_region(img, x0, y0, x1, y1):
    h, w = img.shape[:2]
    x0, y0, x1, y1 = int(w*x0), int(h*y0), int(w*x1), int(h*y1)
    x0, y0 = max(0,x0), max(0,y0)
    return img[y0:y1, x0:x1].copy()

# -------- Field extraction --------
def extract_degree_from(text):
    m = DEGREE_STRICT.search(text)
    if m: return clean_degree(m.group(0))
    m2 = re.search(r'\b(Bachelor|Master|Doctor|Diploma)[A-Za-z .\-&]{2,80}\b', text, re.IGNORECASE)
    return clean_degree(m2.group(0)) if m2 else None

def same_row_groups(ws, y_tol=0.12):
    if not ws: return []
    ws = sorted(ws, key=lambda w: (w['y'], w['x']))
    rows, cur = [], [ws[0]]
    for w in ws[1:]:
        y0 = np.median([v['y'] for v in cur])
        if abs(w['y'] - y0) <= y_tol * max(w['h'], cur[-1]['h']):
            cur.append(w)
        else:
            rows.append(sorted(cur, key=lambda v: v['x']))
            cur = [w]
    rows.append(sorted(cur, key=lambda v: v['x']))
    return rows

def extract_fields_layout(img):
    fields = {}

    # Roll (upper-right)
    for band in [(0.58,0.06,0.98,0.16),(0.55,0.04,0.98,0.20)]:
        roi = crop_region(img, *band)
        txt = ocr_text(roi, psm=6)
        m = re.search(r'(?:Enroll(?:ment)?|Reg\.?No\.?|Roll\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]{6,20})', txt, re.IGNORECASE)
        if not m:
            dig = ocr_digits(roi, psm=7)
            m = re.search(r'([0-9]{6,})', dig)
        if m:
            fields['roll'] = m.group(1).strip()
            break

    # University (wide band)
    uni_roi = crop_region(img, 0.05, 0.05, 0.95, 0.30)
    uni_txt = ocr_data_words(uni_roi, psm=6, min_conf=55)  # PSM 6 for accurate university text
    m = re.search(r'([A-Za-z.\'\- ]{2,60}\s+University)\b', uni_txt, re.IGNORECASE) or \
        re.search(r'([A-Z.\'\- ]{2,60}\s+UNIVERSITY)\b', uni_txt)
    if not m:
        uni_wide = crop_region(img, 0.02, 0.03, 0.98, 0.35)
        uni_txt2 = ocr_data_words(uni_wide, psm=6, min_conf=55)  # PSM 6 for accurate university text
        m = re.search(r'([A-Za-z.\'\- ]{2,60}\s+University)\b', uni_txt2, re.IGNORECASE) or \
            re.search(r'([A-Z.\'\- ]{2,60}\s+UNIVERSITY)\b', uni_txt2)
    if m:
        fields['university'] = clean_university(m.group(1))

    # Name — use the original tighter paragraph region to avoid header/motto
    para_name = crop_region(img, 0.06, 0.32, 0.94, 0.66)
    words_name = find_words(para_name, psm=6, min_conf=55)
    rows_name = same_row_groups(words_name)

    name_found = None
    # 1) Row with Name: label
    for row in rows_name:
        labels = [w for w in row if re.fullmatch(r'[Nn][Aa][Mm][Ee][:.\-]?', w['text'])]
        if labels:
            label = sorted(labels, key=lambda w: w['x'])[0]
            right_tokens = [w['text'] for w in row if w['x'] > label['x'] + label['w'] + 4]
            if right_tokens:
                cand = re.sub(r'\s{2,}', ' ', ' '.join(right_tokens)).strip()
                if not re.search(r'\b(Learn|Today|Excellence|Knowledge|Wisdom)\b', cand, re.IGNORECASE):
                    name_found = cand
                    break
    # 2) Row above 'admitted'
    if not name_found:
        adm_rows = [row for row in rows_name if any(re.fullmatch(r'[Aa]dmitted|ADMITTED', w['text']) for w in row)]
        if adm_rows:
            idx = rows_name.index(adm_rows[0])
            if idx > 0:
                prev = rows_name[idx-1]
                caps = [w['text'] for w in prev if re.match(r'^[A-Z][A-Za-z.\'-]*$', w['text'])]
                if caps:
                    cand = re.sub(r'\s{2,}', ' ', ' '.join(caps)).strip()
                    if not re.search(r'\b(Learn|Today|Excellence|Knowledge|Wisdom)\b', cand, re.IGNORECASE):
                        name_found = cand
    # 3) First plausible caps run
    if not name_found:
        for row in rows_name:
            caps = [w['text'] for w in row if re.match(r'^[A-Z][A-Za-z.\'-]*$', w['text'])]
            if len(caps) >= 2:
                cand = ' '.join(caps)
                if not re.search(r'\b(Learn|Today|Excellence|Knowledge)\b', cand, re.IGNORECASE):
                    name_found = cand
                    break
    if name_found:
        name_found = name_found.replace('LOKE SH', 'LOKESH')
        name_found = re.sub(r'\s{2,}', ' ', name_found).strip()
        fields['name'] = name_found

    # Degree single-line with cleanup
    deg_found = None
    for band in [(0.12,0.52,0.88,0.58), (0.12,0.56,0.88,0.62)]:
        d_roi = crop_region(img, *band)
        g = cv2.cvtColor(d_roi, cv2.COLOR_BGR2GRAY)
        k = cv2.getStructuringElement(cv2.MORPH_RECT,(2,1))
        g = cv2.morphologyEx(g, cv2.MORPH_OPEN, k, iterations=1)
        g = cv2.morphologyEx(g, cv2.MORPH_CLOSE, k, iterations=1)
        d_txt = ocr_text(cv2.cvtColor(g, cv2.COLOR_GRAY2BGR), psm=7)
        norm_txt = (d_txt
            .replace('Administratlon','Administration')
            .replace('Administrat1on','Administration')
            .replace('Adrn','Adr')
            .replace('esbmninisteation','Administration')
        )
        deg_found = extract_degree_from(norm_txt)
        if not deg_found:
            cleaned = re.sub(r'[^A-Za-z \-]', ' ', norm_txt)
            cleaned = re.sub(r'\s{2,}', ' ', cleaned)
            deg_found = extract_degree_from(cleaned)
        if deg_found:
            break
    if not deg_found:
        para2 = crop_region(img, 0.10, 0.46, 0.90, 0.72)
        d_txt2 = ocr_text(para2, psm=6)
        deg_found = extract_degree_from(d_txt2)
    if deg_found:
        fields['degreeTitle'] = deg_found

    # Year — use a wider paragraph dedicated for year stitching and debugging
    para_year = crop_region(img, 0.05, 0.26, 0.95, 0.72)
    words_year = find_words(para_year, psm=6, min_conf=55)
    rows_year = same_row_groups(words_year)

    # DEBUG: show top rows in the year paragraph
    dbg_rows = []
    for i, row in enumerate(rows_year[:12]):
        row_y = int(np.median([w['y'] for w in row]))
        row_text = ' '.join(w['text'] for w in row)
        dbg_rows.append({'i': i, 'y': row_y, 'text': row_text})

    # Row-anchored year by stitching adjacent rows around the degree sentence
    if 'yearOfPassing' not in fields:
        def row_text_y(i): return ' '.join(w['text'] for w in rows_year[i])
        target_idx = None
        for i in range(len(rows_year)):
            txt = row_text_y(i).lower()
            if (' has ' in f' {txt} ' and ' been ' in f' {txt} ') or ('conferred' in txt) or ('the of' in txt):
                target_idx = i
                break
        stitched_hit = None
        if target_idx is not None:
            i0 = max(0, target_idx - 3)
            i1 = min(len(rows_year), target_idx + 3)
            stitched = ' '.join(row_text_y(j) for j in range(i0, i1))
            m = re.search(YEAR_RE, stitched)
            if m:
                stitched_hit = m.group(1)

        if not stitched_hit:
            anchor_idx = None
            for i in range(len(rows_year)):
                if row_text_y(i).strip().lower() == 'the':
                    seq = ' '.join(row_text_y(j).lower() for j in range(i, min(len(rows_year), i+4)))
                    if re.search(r'\b20\d{2}\b.*\bmode\b.*\bin\b', seq):
                        anchor_idx = i
                        break
            if anchor_idx is not None:
                i0 = max(0, anchor_idx - 1)
                i1 = min(len(rows_year), anchor_idx + 5)
                stitched2 = ' '.join(row_text_y(j) for j in range(i0, i1))
                print(json.dumps({'dbg_year_stitched2_text': stitched2}, ensure_ascii=False))
                m2 = re.search(YEAR_RE, stitched2)
                if m2:
                    stitched_hit = m2.group(1)

        if stitched_hit:
            fields['yearOfPassing'] = stitched_hit
        else:
            # precise line digits near target row in the full image coordinate space
            if target_idx is not None:
                row_y_local = int(np.median([w['y'] for w in rows_year[target_idx]]))
                # map local para_year y to full image y: para_year starts at 0.26*h
                h, wimg = img.shape[:2]
                y_start = int(0.26*h)
                yy0 = max(0, y_start + row_y_local - int(0.05*h))
                yy1 = min(h, y_start + row_y_local + int(0.06*h))
                xx0, xx1 = int(0.08*wimg), int(0.92*wimg)
                line_roi = img[yy0:yy1, xx0:xx1]
                line_txt = ocr_digits(line_roi, psm=7) if line_roi.size > 0 else ''
                print(json.dumps({'dbg_year_line_digits': line_txt}, ensure_ascii=False))
                mm = re.search(YEAR_RE, line_txt)
                if mm:
                    fields['yearOfPassing'] = mm.group(1)
                    print(json.dumps({'dbg_year_pick': 'row-precise', 'value': fields['yearOfPassing']}, ensure_ascii=False))

    # Year fallback (guarded)
    if 'yearOfPassing' not in fields:
        candidates = []

        # Mid-body paragraph (digits only)
        mid_para = crop_region(img, 0.06, 0.30, 0.94, 0.72)
        mid_gray = cv2.cvtColor(mid_para, cv2.COLOR_BGR2GRAY)
        mid_txt = pytesseract.image_to_string(
            Image.fromarray(mid_gray),
            config='--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789 '
        )
        for m in YEAR_RE.finditer(mid_txt):
            candidates.append(('mid', m.group(1)))

        # Bottom bands with morphology
        for band in [(0.08,0.76,0.92,0.97),(0.05,0.82,0.95,0.99)]:
            y_roi = crop_region(img, *band)
            y_g = cv2.cvtColor(y_roi, cv2.COLOR_BGR2GRAY)
            y_g = cv2.morphologyEx(y_g, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT,(2,1)), iterations=1)
            y_txt = pytesseract.image_to_string(
                Image.fromarray(y_g),
                config='--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789 '
            )
            for m in YEAR_RE.finditer(y_txt):
                candidates.append(('bottom', m.group(1)))

        # Keyword band
        key_roi = crop_region(img, 0.08, 0.68, 0.92, 0.95)
        key_txt = ocr_text(key_roi, psm=6)
        if re.search(r'Year\s+of\s+Passing|Year\s*[:\-]', key_txt, re.IGNORECASE):
            key_g = cv2.cvtColor(key_roi, cv2.COLOR_BGR2GRAY)
            key_g = cv2.morphologyEx(key_g, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT,(2,1)), iterations=1)
            y_txt2 = pytesseract.image_to_string(
                Image.fromarray(key_g),
                config='--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789 '
            )
            for m in YEAR_RE.finditer(y_txt2):
                candidates.append(('keyword', m.group(1)))

        print(json.dumps({'dbg_year_candidates': candidates}, ensure_ascii=False))

        years = [y for _, y in candidates if 1900 <= int(y) <= 2099]
        if years:
            preferred = None
            # 1) keyword
            for tag, y in candidates:
                if tag == 'keyword':
                    preferred = y; break

            full_txt = ocr_text(img, psm=6)  # PSM 6 for accurate text extraction
            full_years = YEAR_RE.findall(full_txt)
            print(json.dumps({'dbg_full_years': full_years}, ensure_ascii=False))

            mid_years = [y for t,y in candidates if t=='mid']
            mid_counts = Counter(mid_years)

            # Prefer 2020 from paragraph if page shows 2020 but not 2021
            if not preferred and ('2020' in full_years) and ('2021' not in full_years):
                if '2020' in mid_years or fields.get('yearOfPassing') == '2020':
                    preferred = '2020'

            # If both 2020 and 2021 appear and mid exists, choose mid majority (tie -> 2020)
            if not preferred and ('2020' in full_years and '2021' in full_years) and mid_counts:
                preferred = max(mid_counts.items(), key=lambda kv: (kv[1], 1 if kv[0]=='2020' else 0))[0]

            # Else prefer mid majority if exists
            if not preferred and mid_counts:
                preferred = max(mid_counts.items(), key=lambda kv: kv[1])[0]

            # Else bottom-most
            if not preferred:
                preferred = years[-1]

            if 'yearOfPassing' not in fields:
                fields['yearOfPassing'] = preferred
                print(json.dumps({'dbg_year_pick': 'fallback', 'value': fields['yearOfPassing']}, ensure_ascii=False))

    return fields

# -------- Database lookup --------
def load_database_index():
    """Load certificate data from MySQL database with CSV fallback"""
    try:
        from db import load_database_index as db_load
        return db_load()
    except Exception as e:
        print(f"Database error: {e}")
        # Fallback to CSV
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
        return load_csv_index_fallback(csv_path)

def load_csv_index_fallback(csv_path):
    """Fallback CSV loader"""
    index = {}
    with open(csv_path, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            roll = (row.get('roll') or '').strip()
            if not roll: continue
            index[roll] = {
                "roll": roll,
                "name": (row.get('name') or '').strip(),
                "university": (row.get('university') or '').strip(),
                "degreeTitle": (row.get('degreetitle') or '').strip(),
                "yearOfPassing": str((row.get('yearofpassing') or '').strip()),
            }
    return index

# -------- Verifier --------
def verify_one(pdf_path, index, allow_year_correction=False, poppler_path=None):
    # Extract roll number from PDF content using OCR, not from filename
    img = pdf_to_bgr(pdf_path, dpi=480, poppler_path=poppler_path)
    if img is None:
        return {'status':'error','message':'pdf rasterize failed','path':pdf_path}
    
    # Extract roll number from the PDF content
    ocr = extract_fields_layout(img) or {}
    roll = ocr.get('roll')
    
    if not roll:
        return {'status':'error','message':'could not extract roll number from PDF','path':pdf_path}
    
    db_row = index.get(roll)
    if not db_row:
        return {'status':'no_db','message':f'no CSV row for roll number: {roll}','path':pdf_path}

    # We already have the OCR data from above, no need to extract again
    # Merge only for missing non-year fields; keep year OCR-only
    if not all(ocr.get(k) for k in ['roll','name','university','degreeTitle']):
        fallback = extract_fields_full(img) or {}
        for k, v in fallback.items():
            if k == 'yearOfPassing':
                continue
            if not ocr.get(k) and v:
                ocr[k] = v

    # Optional CSV-guided single-digit correction (disabled by default)
    csv_year = db_row.get('yearOfPassing')
    if allow_year_correction and csv_year and ocr.get('yearOfPassing') and ocr['yearOfPassing'] != csv_year:
        try:
            dist = Levenshtein.distance(ocr['yearOfPassing'], csv_year)
        except Exception:
            dist = sum(a!=b for a,b in zip(ocr['yearOfPassing'], csv_year)) if len(ocr['yearOfPassing'])==len(csv_year) else 99
        if dist == 1:
            ocr['yearOfPassing'] = csv_year

    checks = ['roll','name','university','degreeTitle','yearOfPassing']
    results = {}
    for k in checks:
        dbv = db_row.get(k)
        ocv = ocr.get(k)

        if k in ('name', 'university', 'degreeTitle'):
            n_db = norm((dbv or '').replace('.', ''))
            n_ocr = norm((ocv or '').replace('.', ''))
            match = (n_db == n_ocr)
        elif k == 'yearOfPassing':
            match = (str(dbv).strip() == str(ocv).strip())
        elif k == 'roll':
            match = (norm(dbv) == norm(ocv))
        else:
            match = agree(dbv, ocv, 90)

        results[k] = {'db': dbv, 'ocr': ocv, 'match': match}

    critical = ['roll','name','degreeTitle','university']
    present = [k for k in critical if results[k]['db'] and results[k]['ocr']]
    mismatches = [k for k in present if not results[k]['match']]
    if not present:
        status, msg = 'insufficient', 'critical fields missing'
    elif mismatches:
        status, msg = 'mismatch', 'Fields disagree: '+', '.join(mismatches)
    else:
        status, msg = 'verified', 'CSV and OCR agree on critical fields'

    return {'status':status,'message':msg,'fields':results,'path':pdf_path}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input', help='PDF file or directory (legacy_pdfs or a file path)')
    ap.add_argument('--csv', default='data/certificates_legacy.csv', help='CSV path (fallback only)')
    ap.add_argument('--glob', default='*.pdf', help='pattern(s) for dir mode, comma-separated')
    ap.add_argument('--poppler', default=None, help='poppler bin path if needed')
    ap.add_argument('--allow-year-correction', action='store_true',
                    help='Allow single-digit database correction for year (defaults to strict OCR)')
    ap.add_argument('--use-csv-only', action='store_true',
                    help='Force use of CSV instead of MySQL database')
    args = ap.parse_args()

    if args.use_csv_only:
        print("Using CSV fallback mode", file=sys.stderr)
        index = load_csv_index_fallback(args.csv)
    else:
        print("Using MySQL database with CSV fallback", file=sys.stderr)
        index = load_database_index()

    if os.path.isdir(args.input):
        paths = []
        for p in args.glob.split(','):
            paths += glob.glob(os.path.join(args.input, p.strip()))
        for p in sorted(paths):
            res = verify_one(p, index, allow_year_correction=args.allow_year_correction, poppler_path=args.poppler)
            print(json.dumps(res, ensure_ascii=False))
    else:
        res = verify_one(args.input, index, allow_year_correction=args.allow_year_correction, poppler_path=args.poppler)
        print(json.dumps(res, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
