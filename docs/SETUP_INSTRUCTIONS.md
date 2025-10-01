# Certificate Verification System Setup

This system integrates frontend and backend components to provide comprehensive certificate verification using three different pipelines: signature verification, QR code verification, and legacy database verification.

## System Architecture

The system consists of:
1. **Frontend**: React-based web application
2. **Backend**: Express.js API server
3. **Python Scripts**: Certificate verification pipelines

## Pipeline Flow

1. **Signature Pipeline**: Checks for PDF metadata and digital signatures
2. **QR Pipeline**: Scans for QR codes and compares with OCR extracted text
3. **Legacy Pipeline**: Compares OCR results with CSV database records

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Required Python packages (see requirements below)

### Backend Setup

1. **Install Backend Dependencies**:
   ```bash
   # Copy the backend package.json
   cp package-backend.json package.json
   npm install
   ```

2. **Install Python Dependencies**:
   ```bash
   cd certificate_validator
   pip install -r requirements.txt
   ```

3. **Start the Backend Server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

The backend server will run on `http://localhost:3001`

### Frontend Setup

1. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` (or your configured port)

## Python Dependencies

The following Python packages are required for the verification scripts:

```
pikepdf
cryptography
opencv-python
pytesseract
pyzbar
rapidfuzz
pdf2image
Pillow
numpy
```

## File Structure

```
├── src/
│   ├── pages/certificate-verification/
│   │   ├── components/
│   │   │   ├── SignatureVerificationResults.jsx
│   │   │   ├── QRVerificationResults.jsx
│   │   │   ├── LegacyVerificationResults.jsx
│   │   │   └── EnhancedVerificationProgress.jsx
│   │   └── index.jsx
│   └── utils/
│       └── verificationPipeline.js
├── certificate_validator/
│   ├── scripts/
│   │   ├── verify_signature.py
│   │   ├── verify_certificate_image.py
│   │   └── verify_legacy.py
│   ├── keys/
│   └── data/
├── server.js
└── package-backend.json
```

## API Endpoints

### POST /api/verify-certificate

Uploads a certificate file and returns verification results.

**Request**: Multipart form data with `certificate` field
**Response**: JSON with verification results including pipeline type, status, and data

## Verification Pipelines

### 1. Signature Pipeline
- Checks for PDF metadata and digital signatures
- Validates file integrity using hash comparison
- Verifies public key fingerprints
- **Output**: Document view + Verification results (no QR scanner tab)

### 2. QR Pipeline
- Performs OCR text extraction
- Scans for QR codes
- Compares QR data with OCR results
- **Output**: Document view + Text extraction + Verification results (no QR scanner tab)

### 3. Legacy Pipeline
- Performs OCR text extraction
- Compares with CSV database records
- **Output**: Document view + Text extraction + Verification results (no QR scanner tab)

## Features

- **Dynamic Pipeline Selection**: Automatically determines the appropriate verification method
- **Progress Indicators**: Real-time progress tracking with pipeline-specific steps
- **Multiple Result Views**: Different result components for each pipeline type
- **Loading Graphics**: Enhanced progress indicators as shown in the provided images
- **Field Comparison**: Detailed comparison tables for QR and Legacy pipelines
- **Hash Verification**: Detailed signature verification for signed documents

## Usage

1. Upload a certificate file (PDF, JPG, PNG)
2. The system automatically determines the verification pipeline
3. Progress is shown with pipeline-specific steps
4. Results are displayed in the appropriate format based on the pipeline used

## Error Handling

The system includes comprehensive error handling for:
- File upload failures
- Python script execution errors
- Network connectivity issues
- Invalid file formats

## Development Notes

- The backend server handles all Python script execution
- Frontend communicates with backend via REST API
- Pipeline selection is handled automatically by the backend
- Progress simulation provides realistic user experience
- All verification results are properly formatted for display







