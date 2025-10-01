// Demo script to show the certificate verification system
const express = require('express');
const multer = require('multer');
const path = require('path');

// Mock verification results for demonstration
const mockResults = {
  signature: {
    pipeline: 'signature',
    status: 'invalid',
    message: 'Delivered file bytes differ from recorded signed_hash',
    data: {
      status: 'invalid',
      reason: 'Delivered file bytes differ from recorded signed_hash',
      hash_algo: 'SHA256',
      sig_alg: 'RSA-PSS',
      stored_original_hash: '4bd5ead95fe1244eedd0a7198686d41f44ec62bd0a4881e0da7950f9804573a0',
      stored_signed_hash: 'f40f5e577780efa986721219edddeb132db3c5db42aea459a8638f16e76dd4b2',
      current_hash: '660fa6ee426b6fa7c624015f5946405c29c4361488e1d07b5965134517ed1644',
      pubkey_fingerprint_pdf: '2d068549ec4832546fbe3f65f5f02611fef89c98d310875497e0fdb43dadcffd',
      pubkey_fingerprint_arg: '2d068549ec4832546fbe3f65f5f02611fef89c98d310875497e0fdb43dadcffd',
      signed_present: true,
      signature_ok: true,
      signed_hash_match: false
    },
    timestamp: new Date().toISOString()
  },
  qr: {
    pipeline: 'qr',
    status: 'verified',
    message: 'QR and OCR agree on critical fields',
    data: {
      status: 'verified',
      message: 'QR and OCR agree on critical fields',
      fields: {
        roll: {
          qr: '01110153011',
          ocr: '01110153011',
          match: true,
          struct_ok: true
        },
        name: {
          qr: 'Simran Kaur',
          ocr: 'Simran Kaur',
          match: true
        },
        university: {
          qr: 'Ranchi University',
          ocr: 'Ranchi University',
          match: true
        },
        degreeTitle: {
          qr: 'Bachelor of Engineering',
          ocr: 'BACHELOR OF ENGINEERING',
          match: true
        },
        branch: {
          qr: 'Mechanical Engineering',
          ocr: 'MECHANICAL ENGINEERING',
          match: true
        },
        exam_date: {
          qr: 'June 2021',
          ocr: 'JUNE 2021',
          match: true
        }
      },
      qr_bbox: [1498, 2192, 553, 555],
      path: 'qr_pdf_output/01110153011.pdf'
    },
    timestamp: new Date().toISOString()
  },
  legacy: {
    pipeline: 'legacy',
    status: 'verified',
    message: 'CSV and OCR agree on critical fields',
    data: {
      status: 'verified',
      message: 'CSV and OCR agree on critical fields',
      fields: {
        roll: {
          db: '20206502',
          ocr: '20206502',
          match: true
        },
        name: {
          db: 'ASHOK M',
          ocr: 'ASHOK M',
          match: true
        },
        university: {
          db: 'MANGALAYATAN UNIVERSITY',
          ocr: 'MANGALAYATAN UNIVERSITY',
          match: true
        },
        degreeTitle: {
          db: 'BACHELOR OF BUSINESS ADMINISTRATION',
          ocr: 'Bachelor of Business Administration',
          match: true
        },
        yearOfPassing: {
          db: '2020',
          ocr: '2020',
          match: true
        }
      },
      path: 'legacy_pdfs/20206502.pdf'
    },
    timestamp: new Date().toISOString()
  }
};

const app = express();
const PORT = 3001;

app.use(express.json());

// Mock API endpoint for demonstration
app.post('/api/verify-certificate', (req, res) => {
  // Simulate processing delay
  setTimeout(() => {
    // Randomly select a pipeline result for demo
    const pipelines = ['signature', 'qr', 'legacy'];
    const randomPipeline = pipelines[Math.floor(Math.random() * pipelines.length)];
    
    res.json(mockResults[randomPipeline]);
  }, 3000); // 3 second delay to simulate processing
});

app.listen(PORT, () => {
  console.log(`Demo server running on port ${PORT}`);
  console.log('This is a mock server for demonstration purposes.');
  console.log('Upload a certificate file to see the verification system in action.');
});







