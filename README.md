# Academic Certificate Verification System

A comprehensive certificate verification system that uses multiple verification methods including blockchain, digital signatures, QR codes, and legacy database lookups.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python 3.8+**
- **Docker** and **Docker Compose**
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Academicvalidator
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Install system dependencies (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install -y tesseract-ocr poppler-utils libzbar0 python3-dev libgl1-mesa-glx libglib2.0-0
   ```

4. **Set up the blockchain network:**
   ```bash
   chmod +x blockchain-setup.sh
   ./blockchain-setup.sh
   ```
   Choose option 4 for full setup (start network + deploy chaincode).

5. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🏗️ System Architecture

### Components

1. **Frontend** (React + Vite)
   - Modern web interface for certificate upload
   - Real-time verification progress
   - Multiple result display formats

2. **Backend** (Express.js)
   - REST API for certificate processing
   - Python script orchestration
   - File upload handling

3. **Verification Pipelines**
   - **Blockchain Verification**: Hyperledger Fabric network
   - **Digital Signature Verification**: PDF signature validation
   - **QR Code Verification**: OCR + QR code scanning
   - **Legacy Database Verification**: MySQL/CSV lookup

4. **Blockchain Network** (Hyperledger Fabric)
   - PDF hash storage and verification
   - Immutable certificate records
   - Multi-organization setup

## 📋 Verification Methods

### 1. Blockchain Verification
- Stores PDF hashes on Hyperledger Fabric blockchain
- Provides immutable certificate records
- Cross-organization verification

### 2. Digital Signature Verification
- Validates PDF digital signatures
- Checks certificate authenticity
- Verifies issuer identity

### 3. QR Code Verification
- Scans QR codes embedded in certificates
- Compares with OCR extracted text
- Validates certificate content

### 4. Legacy Database Verification
- MySQL database lookup
- CSV file fallback
- Historical certificate verification

## 🔧 Configuration

### Environment Variables

Create `backend/.env`:
```env
# Email configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Python path (if not in system PATH)
# PYTHON_PATH=/path/to/your/python3
```

### Database Configuration

Create `backend/certificate_validator/config.env`:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=certificate_validator
DB_USER=your_username
DB_PASSWORD=your_password

# Optional: SSL Configuration
DB_SSL_DISABLED=true

# System paths
POPPLER_PATH=/usr/bin
TESSERACT_PATH=/usr/bin
PYTHON_PATH=/usr/bin/python3
```

## 🐳 Docker Commands

### Blockchain Network Management

```bash
# Start network
cd blockchain/fabric-samples/test-network
./network.sh up createChannel -ca

# Deploy chaincode
./network.sh deployCC -ccn pdfhash -ccp ../pdfhash-chaincode -ccl go

# Stop network
./network.sh down

# Clean everything
./network.sh down -v
```

### Using the Setup Script

```bash
./blockchain-setup.sh
```

## 📁 Project Structure

```
Academicvalidator/
├── frontend/                 # React frontend
├── backend/                  # Express.js backend
│   ├── certificate_validator/
│   │   ├── scripts/         # Python verification scripts
│   │   ├── keys/           # Certificate keys (gitignored)
│   │   ├── data/           # Database files (gitignored)
│   │   └── config.env      # Database config (gitignored)
├── blockchain/              # Hyperledger Fabric setup
│   ├── fabric-samples/
│   │   └── test-network/
│   └── fabric/
├── docs/                   # Documentation
├── setup.sh               # Main setup script
├── blockchain-setup.sh    # Blockchain setup script
└── README.md
```

## 🔍 API Endpoints

### POST /api/verify-certificate
Uploads and verifies a certificate file.

**Request:** Multipart form data with `certificate` field
**Response:** JSON with verification results

```json
{
  "status": "verified",
  "pipeline": "blockchain",
  "verification_details": {
    "hash_verification": {...},
    "blockchain_information": {...}
  }
}
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload
```

### Python Scripts
```bash
cd backend/certificate_validator
source venv/bin/activate
python scripts/verify_blockchain.py path/to/certificate.pdf
```

## 🧪 Testing

### Test Blockchain Verification
```bash
# Test with a known hash
python3 backend/certificate_validator/scripts/verify_blockchain.py backend/certificate_validator/test_both.pdf
```

### Test All Pipelines
```bash
python3 backend/certificate_validator/scripts/verify_unified.py backend/certificate_validator/test_signed.pdf
```

## 📚 Documentation

- [Setup Instructions](docs/SETUP_INSTRUCTIONS.md)
- [Python Dependencies](PYTHON_SETUP.md)
- [MySQL Setup](backend/certificate_validator/MYSQL_SETUP_GUIDE.md)

## 🔒 Security

- All sensitive configuration files are gitignored
- Certificate keys and database files are excluded from version control
- Environment variables for sensitive data
- Docker containers for isolated execution

## 🐛 Troubleshooting

### Common Issues

1. **Docker not running:**
   ```bash
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   ```

2. **Python dependencies missing:**
   ```bash
   sudo apt install python3-venv
   cd backend/certificate_validator
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Blockchain network issues:**
   ```bash
   ./blockchain-setup.sh
   # Choose option 5 to clean everything, then option 4 for full setup
   ```

4. **System dependencies missing:**
   ```bash
   sudo apt install tesseract-ocr poppler-utils libzbar0
   ```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository.