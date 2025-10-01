#!/bin/bash

# Certificate Verification System Setup Script
echo "🚀 Setting up Certificate Verification System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher first."
    exit 1
fi

echo "✅ Node.js and Python 3 are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install Python dependencies in virtual environment
echo "🐍 Setting up Python virtual environment..."
cd certificate_validator

# Check if virtual environment already exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        echo "   Make sure python3-venv is installed: sudo apt install python3-venv"
        exit 1
    fi
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate

if [ -f "requirements.txt" ]; then
    echo "Installing Python packages..."
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Python dependencies installed successfully"
    else
        echo "❌ Failed to install Python dependencies"
        echo "   Please check the requirements.txt file and try again"
        exit 1
    fi
else
    echo "⚠️  No requirements.txt found in certificate_validator directory"
fi

# Install additional system dependencies that might be needed
echo "Installing additional system dependencies..."
echo "Note: You may need to install these system packages:"
echo "  - tesseract-ocr: sudo apt install tesseract-ocr"
echo "  - poppler-utils: sudo apt install poppler-utils"
echo "  - libzbar0: sudo apt install libzbar0"

deactivate
cd ../..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env << EOF
# Email configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Python path (if not in system PATH)
# PYTHON_PATH=/path/to/your/python3
EOF
    echo "✅ Created backend/.env file"
    echo "   Please edit backend/.env with your email configuration if needed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "For development with auto-restart:"
echo "Backend: cd backend && npm run dev"
echo "Frontend: cd frontend && npm run dev"
