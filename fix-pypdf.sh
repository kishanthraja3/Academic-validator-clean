#!/bin/bash

# Fix pypdf installation script
echo "🔧 Fixing pypdf installation..."

cd backend/certificate_validator

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run ./install-python-deps.sh first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Remove old PyPDF2 and install correct pypdf
echo "Removing old PyPDF2 package..."
pip uninstall -y PyPDF2

echo "Installing correct pypdf package..."
pip install pypdf

echo "Installing reportlab (needed for PDF generation)..."
pip install reportlab

echo "Testing pypdf import..."
python3 -c "
try:
    from pypdf import PdfReader, PdfWriter
    print('✅ pypdf imported successfully')
except ImportError as e:
    print(f'❌ pypdf import failed: {e}')
"

echo "✅ pypdf fix completed!"
echo "You can now run your verification scripts."

deactivate
cd ../..
