# Python Dependencies Setup Guide

## Overview

The certificate verification system requires Python 3.8+ with several libraries for PDF processing, image analysis, OCR, QR code scanning, and cryptography.

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
./setup.sh
```

### Option 2: Python Dependencies Only
```bash
./install-python-deps.sh
```

### Option 3: Manual Setup
```bash
cd backend/certificate_validator

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install build tools first
pip install --upgrade pip setuptools wheel

# Install all dependencies
pip install -r requirements.txt
```

## Required System Packages

Before installing Python packages, install these system dependencies:

```bash
# For OCR (pytesseract)
sudo apt install tesseract-ocr

# For PDF to image conversion (pdf2image)
sudo apt install poppler-utils

# For QR/barcode scanning (pyzbar)
sudo apt install libzbar0

# For Python compilation
sudo apt install python3-dev python3-venv

# For OpenCV
sudo apt install libgl1-mesa-glx libglib2.0-0
```

## Python Dependencies

All required packages are listed in `backend/certificate_validator/requirements.txt`:

### Core PDF Processing
- `pikepdf` - PDF manipulation and digital signature handling
- `pypdf` - PDF reading and writing (newer version of PyPDF2)
- `pdf2image` - Convert PDF pages to images
- `reportlab` - PDF generation and manipulation

### Image Processing
- `opencv-python` - Computer vision and image processing
- `Pillow` - Image manipulation
- `numpy` - Numerical computing

### QR Code & Barcode
- `pyzbar` - QR code and barcode decoding
- `qrcode` - QR code generation

### OCR
- `pytesseract` - Optical Character Recognition wrapper for Tesseract

### Cryptography
- `cryptography` - Digital signatures and encryption

### Text Processing
- `rapidfuzz` - Fuzzy string matching for certificate verification

### Database (Optional)
- `mysql-connector-python` - MySQL database connectivity

### Utilities
- `requests` - HTTP requests
- `python-dotenv` - Environment variable management

## Troubleshooting

### Issue: "externally-managed-environment" error
**Solution**: Always use a virtual environment (this is now handled automatically by setup.sh)

### Issue: "Cannot import 'setuptools.build_meta'"
**Solution**: Run this command in your virtual environment:
```bash
source backend/certificate_validator/venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r backend/certificate_validator/requirements.txt
```

### Issue: OpenCV import fails
**Solution**: Install system dependencies:
```bash
sudo apt install libgl1-mesa-glx libglib2.0-0
```

### Issue: pyzbar import fails
**Solution**: Install libzbar0:
```bash
sudo apt install libzbar0
```

### Issue: pytesseract fails
**Solution**: Install Tesseract OCR:
```bash
sudo apt install tesseract-ocr
```

### Issue: "No module named 'pypdf'" or "No module named 'PyPDF2'"
**Solution**: This happens when the wrong PDF library is installed. Fix it with:
```bash
./fix-pypdf.sh
```
Or manually:
```bash
cd backend/certificate_validator
source venv/bin/activate
pip uninstall -y PyPDF2
pip install pypdf reportlab
```

## Testing Python Setup

After installation, test your setup:

```bash
cd backend/certificate_validator
source venv/bin/activate
python3 -c "
import pikepdf
import cv2
import pyzbar
import pytesseract
from cryptography.hazmat.primitives import hashes
print('All imports successful!')
"
```

## Server Configuration

The backend server automatically detects and uses the virtual environment Python:
1. First checks: `backend/certificate_validator/venv/bin/python3`
2. Falls back to: `PYTHON_PATH` environment variable
3. Final fallback: `python3` from system PATH

## Environment Variables

You can optionally set the Python path in `backend/.env`:

```env
# Python path (only if not using virtual environment)
PYTHON_PATH=/path/to/your/python3
```

## Virtual Environment Location

The virtual environment is located at:
```
backend/certificate_validator/venv/
```

This directory is automatically excluded from git via `.gitignore`.

## Updating Dependencies

To update Python dependencies:

```bash
cd backend/certificate_validator
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

## Complete Package List

The system uses the following Python packages:
- setuptools>=65.0.0
- wheel>=0.37.0
- pikepdf>=8.0.0
- pypdf>=3.0.0
- pdf2image>=1.16.0
- reportlab>=4.0.0
- opencv-python>=4.8.0
- Pillow>=10.0.0
- numpy>=1.24.0
- pyzbar>=0.1.9
- qrcode>=7.4.0
- pytesseract>=0.3.10
- cryptography>=41.0.0
- rapidfuzz>=3.0.0
- mysql-connector-python>=8.1.0
- requests>=2.31.0
- python-dotenv>=1.0.0
- pytest>=7.4.0

All packages use `>=` to allow compatible newer versions while maintaining minimum requirements.
