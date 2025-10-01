#!/bin/bash

# Python dependencies installation script
echo "🐍 Installing Python dependencies in virtual environment..."

cd backend/certificate_validator

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        echo "   Install python3-venv: sudo apt install python3-venv"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip and install build tools first
echo "Installing build tools..."
pip install --upgrade pip
pip install setuptools wheel

# Install packages one by one to identify problematic ones
echo "Installing Python packages..."

# Core packages first
pip install setuptools wheel
pip install numpy
pip install Pillow
pip install requests
pip install python-dotenv

# PDF processing packages
pip install pypdf
pip install pikepdf
pip install reportlab

# Image processing
pip install opencv-python
pip install pdf2image

# QR and barcode processing
pip install pyzbar
pip install qrcode

# OCR
pip install pytesseract

# Cryptography
pip install cryptography

# Text processing
pip install rapidfuzz

# Database (optional)
pip install mysql-connector-python

# Development tools (optional)
pip install pytest

echo "✅ Python dependencies installation completed!"

# Test import of key modules
echo "Testing imports..."
python3 -c "
import sys
try:
    import pikepdf
    print('✅ pikepdf imported successfully')
except ImportError as e:
    print(f'❌ pikepdf import failed: {e}')

try:
    import cv2
    print('✅ opencv-python imported successfully')
except ImportError as e:
    print(f'❌ opencv-python import failed: {e}')

try:
    import pyzbar
    print('✅ pyzbar imported successfully')
except ImportError as e:
    print(f'❌ pyzbar import failed: {e}')

try:
    import pytesseract
    print('✅ pytesseract imported successfully')
except ImportError as e:
    print(f'❌ pytesseract import failed: {e}')

try:
    from cryptography.hazmat.primitives import hashes
    print('✅ cryptography imported successfully')
except ImportError as e:
    print(f'❌ cryptography import failed: {e}')
"

echo ""
echo "📋 System dependencies that may be needed:"
echo "  sudo apt install tesseract-ocr"
echo "  sudo apt install poppler-utils"
echo "  sudo apt install libzbar0"
echo "  sudo apt install python3-dev"
echo "  sudo apt install libgl1-mesa-glx"
echo "  sudo apt install libglib2.0-0"

deactivate
cd ../..
