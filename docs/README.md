# Certificate Verification System

A comprehensive certificate verification system with React frontend and Node.js backend, supporting multiple verification pipelines including digital signatures, QR codes, and legacy verification methods.

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── academic-final/    # Blockchain/Hyperledger Fabric components
└── docs/             # Documentation files
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ (for backend verification scripts)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd authenticity_validator_academia_frontend
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up Python environment (for verification scripts)**
   ```bash
   cd backend/certificate_validator
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Email configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Python path (if not in system PATH)
PYTHON_PATH=/path/to/your/python3
```

## Features

- **Multiple Verification Pipelines**
  - Digital signature verification
  - QR code verification
  - Legacy certificate verification
  - Unified verification system

- **Modern React Frontend**
  - Responsive design with Tailwind CSS
  - Real-time verification status
  - File upload with drag & drop
  - Email integration

- **Robust Backend API**
  - Express.js server
  - File upload handling
  - Caching system
  - Error handling and logging

## API Endpoints

- `POST /api/verify-certificate` - Upload and verify certificates
- `POST /api/send-email` - Send verification results via email

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm start        # Start production server
npm run dev      # Start with nodemon (auto-restart)
```

## Blockchain Integration

The `academic-final/` directory contains Hyperledger Fabric blockchain components for advanced certificate verification and immutability features.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details