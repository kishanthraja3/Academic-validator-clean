require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cache for verification results
const verificationCache = new Map();

// Helper function to get Python path (prefer virtual environment)
function getPythonPath(basePath) {
  const venvPythonPath = path.join(basePath, 'venv', 'bin', 'python3');
  return fs.existsSync(venvPythonPath) ? venvPythonPath : (process.env.PYTHON_PATH || 'python3');
}

// Email configuration (only if valid credentials are provided)
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'your-email@gmail.com' && 
    process.env.EMAIL_PASS !== 'your-app-password') {
  emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.log('Email configuration not set - email functionality disabled');
}

// Function to check if a file is likely a signature file
async function checkIfLikelySignatureFile(filePath, basePath, scriptsPath) {
  try {
    // Always let the unified verification script determine the pipeline
    // Don't bypass the unified script for any files
    return false;
  } catch (e) {
    return false;
  }
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      verificationCache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Configure multer for file uploads with memory storage for better performance
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
    }
  }
});

// Ensure temp directory exists
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}

// Routes
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate file hash for caching
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    
    // Check cache first (disabled for debugging)
    if (false && verificationCache.has(fileHash)) {
      const cached = verificationCache.get(fileHash);
      console.log('Cache hit for file:', fileHash.substring(0, 8));
      return res.json(cached.result);
    }
    
    // Clear cache for debugging
    verificationCache.clear();
    console.log('Cache cleared for debugging');
    console.log('File hash for this request:', fileHash.substring(0, 16));
    console.log('Cache size after clear:', verificationCache.size);
    console.log('=== NEW HASH INTEGRITY CODE RUNNING ===');

    // Create temporary file with binary write to preserve exact file structure
    tempFilePath = path.join('temp', `${Date.now()}-${fileHash.substring(0, 8)}.${getFileExtension(req.file.mimetype)}`);
    
    // Write file in binary mode to preserve exact structure
    fs.writeFileSync(tempFilePath, req.file.buffer, { encoding: null });
    
    // If this is a signed PDF, copy the corresponding signature file to temp directory
    const originalFileName = req.file.originalname;
    const signatureFileName = originalFileName + '.sig.json';
    const signatureFilePath = path.join('certificate_validator', 'signed', signatureFileName);
    const tempSignaturePath = tempFilePath + '.sig.json';
    
    if (fs.existsSync(signatureFilePath)) {
      console.log(`Copying signature file: ${signatureFilePath} -> ${tempSignaturePath}`);
      fs.copyFileSync(signatureFilePath, tempSignaturePath);
    }
    
    // Debug: Log file information
    console.log('Original file buffer size:', req.file.buffer.length);
    console.log('Temporary file path:', tempFilePath);
    console.log('Temporary file size:', fs.statSync(tempFilePath).size);
    
    // Verify file integrity by comparing hashes
    const tempFileBuffer = fs.readFileSync(tempFilePath);
    const tempFileHash = crypto.createHash('sha256').update(tempFileBuffer).digest('hex');
    const originalFileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    console.log('Original file hash:', originalFileHash.substring(0, 16));
    console.log('Temporary file hash:', tempFileHash.substring(0, 16));
    console.log('File hashes match:', originalFileHash === tempFileHash);
    
    // If file hashes don't match, there's a problem with file creation
    if (originalFileHash !== tempFileHash) {
      console.error('ERROR: File integrity check failed! Temporary file differs from original.');
      console.error('This will cause signature verification to fail due to hash mismatch.');
      console.error('Original file size:', req.file.buffer.length);
      console.error('Temporary file size:', tempFileBuffer.length);
      
      // Try to fix by recreating the temporary file
      console.log('Attempting to recreate temporary file...');
      fs.unlinkSync(tempFilePath);
      fs.writeFileSync(tempFilePath, req.file.buffer, { encoding: null });
      
      // Verify again
      const newTempFileBuffer = fs.readFileSync(tempFilePath);
      const newTempFileHash = crypto.createHash('sha256').update(newTempFileBuffer).digest('hex');
      console.log('New temporary file hash:', newTempFileHash.substring(0, 16));
      console.log('File hashes match after recreation:', originalFileHash === newTempFileHash);
      
      if (originalFileHash !== newTempFileHash) {
        return res.status(500).json({ error: 'File integrity check failed - unable to create identical temporary file' });
      }
    }
    

    const basePath = path.join(__dirname, 'certificate_validator');
    const scriptsPath = path.join(basePath, 'scripts');

    // Use unified verification script for optimal performance
    const startTime = Date.now();
    console.log('Starting verification for file:', tempFilePath);
    
    // DEBUG: Also test with original file buffer directly
    console.log('DEBUG: Testing signature verification with original file buffer...');
    console.log('Original uploaded file hash:', originalFileHash.substring(0, 16));
    
    // Use unified verification script for optimal performance
    // For signature verification, we need to use the original file to avoid hash mismatch
    // For other pipelines, temporary file works fine
    let result;
    
    // First, do a quick check to see if this might be a signature file
    const isLikelySignatureFile = await checkIfLikelySignatureFile(tempFilePath, basePath, scriptsPath);
    
    if (isLikelySignatureFile) {
      console.log('=== SIGNATURE FILE DETECTED - USING ORIGINAL HASH ===');
      console.log('File appears to be a signature file, using original buffer for verification');
      // For signature files, create a temporary file from the original buffer
      // to ensure exact file integrity for signature verification
      const signatureTempPath = path.join('temp', `signature-${Date.now()}-${fileHash.substring(0, 8)}.pdf`);
      fs.writeFileSync(signatureTempPath, req.file.buffer, { encoding: null });
      
      // Verify the signature temp file matches the original
      const sigTempBuffer = fs.readFileSync(signatureTempPath);
      const sigTempHash = crypto.createHash('sha256').update(sigTempBuffer).digest('hex');
      console.log('Signature temp file hash:', sigTempHash.substring(0, 16));
      console.log('Original file hash:', originalFileHash.substring(0, 16));
      console.log('Signature temp file matches original:', sigTempHash === originalFileHash);
      
      // DEBUG: Compare file sizes
      console.log('Original buffer size:', req.file.buffer.length);
      console.log('Signature temp file size:', sigTempBuffer.length);
      console.log('Regular temp file size:', fs.statSync(tempFilePath).size);
      
      // DEBUG: Compare first and last few bytes
      console.log('Original buffer first 16 bytes:', req.file.buffer.slice(0, 16).toString('hex'));
      console.log('Signature temp first 16 bytes:', sigTempBuffer.slice(0, 16).toString('hex'));
      console.log('Original buffer last 16 bytes:', req.file.buffer.slice(-16).toString('hex'));
      console.log('Signature temp last 16 bytes:', sigTempBuffer.slice(-16).toString('hex'));
      
      if (sigTempHash === originalFileHash) {
        console.log('=== USING ORIGINAL HASH FOR SIGNATURE VERIFICATION ===');
        console.log('Using signature temp file for verification');
        console.log('Original file hash being passed to Python:', originalFileHash);
        
        // Copy sidecar file if it exists for the uploaded file
        // Try to find a matching sidecar file in the signed directory
        const signedDir = path.join(basePath, 'signed');
        const tempSidecarPath = signatureTempPath + '.sig.json';
        let sidecarPath = null;
        
        // Look for any .sig.json file in the signed directory
        if (fs.existsSync(signedDir)) {
          const files = fs.readdirSync(signedDir);
          const sigFiles = files.filter(file => file.endsWith('.sig.json'));
          
          // Try to find a sidecar file that matches the current file hash
          for (const sigFile of sigFiles) {
            const fullSigPath = path.join(signedDir, sigFile);
            try {
              const sigContent = JSON.parse(fs.readFileSync(fullSigPath, 'utf8'));
              // Check if the signed_hash in the sidecar matches our current file hash
              if (sigContent.signed_hash === originalFileHash) {
                sidecarPath = fullSigPath;
                console.log('Found matching sidecar file for hash:', originalFileHash.substring(0, 16));
                break;
              }
            } catch (e) {
              console.log('Error reading sidecar file:', sigFile, e.message);
            }
          }
          
          // Don't use fallback sidecar files - let the unified script handle detection
          if (!sidecarPath) {
            console.log('No matching sidecar file found - will use PDF internal metadata if available');
          }
        }
        
        if (sidecarPath && fs.existsSync(sidecarPath)) {
          console.log('Copying sidecar file for signature verification');
          console.log('From:', sidecarPath);
          console.log('To:', tempSidecarPath);
          fs.copyFileSync(sidecarPath, tempSidecarPath);
          console.log('Sidecar file copied successfully');
        } else {
          console.log('No sidecar file found, will use PDF internal metadata');
        }
        
        // Pass the original file hash to the Python script for comparison
        result = await runUnifiedVerificationWithHash(signatureTempPath, basePath, scriptsPath, originalFileHash);
        
        // Clean up signature temp file and sidecar
        if (fs.existsSync(signatureTempPath)) {
          fs.unlinkSync(signatureTempPath);
        }
        if (fs.existsSync(tempSidecarPath)) {
          fs.unlinkSync(tempSidecarPath);
        }
      } else {
        console.log('Signature temp file mismatch, falling back to regular temp file');
        result = await runUnifiedVerification(tempFilePath, basePath, scriptsPath);
      }
    } else {
      console.log('File appears to be regular file, using temporary file for verification');
      result = await runUnifiedVerification(tempFilePath, basePath, scriptsPath);
    }
    console.log('Verification result:', result);
    
    // DEBUG: Compare with direct signature verification
    if (result.pipeline === 'signature') {
      console.log('DEBUG: Signature pipeline used, comparing with direct verification...');
      console.log('Current hash from pipeline:', result.current_hash?.substring(0, 16));
      console.log('Stored signed hash from pipeline:', result.stored_signed_hash?.substring(0, 16));
      console.log('Original file hash:', originalFileHash.substring(0, 16));
      
      // Check if the current hash matches the original file hash
      if (result.current_hash && result.current_hash !== originalFileHash) {
        console.error('ERROR: Current hash from pipeline does not match original file hash!');
        console.error('This indicates the temporary file is different from the original.');
      } else {
        console.log('SUCCESS: Current hash matches original file hash.');
      }
    }

    const processingTime = Date.now() - startTime;
    result.processingTime = processingTime;
    result.timestamp = new Date().toISOString();

    // Send email notification for invalid certificates
    if (result.status === 'invalid' || result.status === 'mismatch' || result.status === 'error') {
      try {
        await sendInvalidCertificateEmail(result, req.file.originalname);
      } catch (emailError) {
        console.error('Failed to send invalid certificate email:', emailError);
        // Don't fail the verification if email fails
      }
    }

    // Cache the result
    verificationCache.set(fileHash, {
      result,
      timestamp: Date.now()
    });

    console.log(`Verification completed in ${processingTime}ms using ${result.pipeline} pipeline`);
    res.json(result);

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed', 
      message: error.message,
      pipeline: 'error'
    });
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

// Helper function to get file extension
function getFileExtension(mimetype) {
  const extensions = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png'
  };
  return extensions[mimetype] || 'bin';
}

// Unified verification function for optimal performance
function runUnifiedVerification(filePath, basePath, scriptsPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(scriptsPath, 'verify_unified.py');
    
    console.log('Calling unified verification with:');
    console.log('  Python script:', pythonScript);
    console.log('  File path:', filePath);
    console.log('  Base path:', basePath);
    
    const pythonPath = getPythonPath(basePath);
    const pythonProcess = spawn(pythonPath, [pythonScript, filePath, '--base-path', basePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000 // 30 second timeout for unified verification
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout during unified verification'));
      }
    }, 30000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.log('Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      console.log('Python script exit code:', code);
      console.log('Python script output:', output);
      console.log('Python script error:', error);
      
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        console.error('Failed to parse Python output:', e);
        console.error('Raw output:', output);
        reject(new Error(`Failed to parse unified verification result: ${e.message}. Output: ${output}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      reject(new Error(`Unified verification failed: ${err.message}`));
    });
  });
}

// Unified verification function with original file hash for signature verification
function runUnifiedVerificationWithHash(filePath, basePath, scriptsPath, originalFileHash) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(scriptsPath, 'verify_unified.py');
    
    console.log('Calling unified verification with hash:');
    console.log('  Python script:', pythonScript);
    console.log('  File path:', filePath);
    console.log('  Base path:', basePath);
    console.log('  Original file hash:', originalFileHash.substring(0, 16));
    
    const pythonPath = getPythonPath(basePath);
    const pythonProcess = spawn(pythonPath, [pythonScript, filePath, '--base-path', basePath, '--original-hash', originalFileHash], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000 // 30 second timeout for unified verification
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout during unified verification'));
      }
    }, 30000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.log('Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      console.log('Python script exit code:', code);
      console.log('Python script output:', output);
      console.log('Python script error:', error);
      
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        console.error('Failed to parse Python output:', e);
        console.error('Raw output:', output);
        reject(new Error(`Failed to parse unified verification result: ${e.message}. Output: ${output}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      reject(new Error(`Unified verification failed: ${err.message}`));
    });
  });
}

// Helper functions with timeout and optimization (kept for fallback)
function checkPdfMetadata(filePath, basePath, scriptsPath) {
  return new Promise((resolve) => {
    const pythonScript = path.join(scriptsPath, 'verify_signature.py');
    const publicKeyPath = path.join(basePath, 'keys', 'pub.pem');
    
    const pythonPath = getPythonPath(basePath);
    const pythonProcess = spawn(pythonPath, [pythonScript, '--pdf-path', filePath, '--public-key', publicKeyPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000 // 10 second timeout
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        resolve({ hasMetadata: false, error: 'Timeout while checking metadata' });
      }
    }, 10000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({ hasMetadata: true, result });
        } catch (e) {
          resolve({ hasMetadata: false, error: 'Failed to parse signature result' });
        }
      } else {
        try {
          const result = JSON.parse(output);
          resolve({ hasMetadata: result.signed_present || false, result });
        } catch (e) {
          resolve({ hasMetadata: false, error: error || 'No metadata found' });
        }
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve({ hasMetadata: false, error: err.message });
    });
  });
}

function runSignaturePipeline(filePath, basePath, scriptsPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(scriptsPath, 'verify_signature.py');
    const publicKeyPath = path.join(basePath, 'keys', 'pub.pem');
    
    const pythonPath = getPythonPath(basePath);
    const pythonProcess = spawn(pythonPath, [pythonScript, '--pdf-path', filePath, '--public-key', publicKeyPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 15000 // 15 second timeout for signature verification
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout during signature verification'));
      }
    }, 15000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      try {
        const result = JSON.parse(output);
        resolve({
          status: result.status,
          message: result.reason,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        reject(new Error('Failed to parse signature verification result'));
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      reject(new Error(`Signature verification failed: ${err.message}`));
    });
  });
}

function runQRPipeline(filePath, scriptsPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(scriptsPath, 'verify_certificate_image.py');
    
    const pythonPath = getPythonPath('.');
    const pythonProcess = spawn(pythonPath, [pythonScript, filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000 // 10 second timeout for QR verification (optimized)
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout during QR verification'));
      }
    }, 10000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      try {
        const result = JSON.parse(output);
        resolve({
          status: result.status,
          message: result.message,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        reject(new Error('Failed to parse QR verification result'));
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      reject(new Error(`QR verification failed: ${err.message}`));
    });
  });
}

function runLegacyPipeline(filePath, basePath, scriptsPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(scriptsPath, 'verify_legacy.py');
    const csvPath = path.join(basePath, 'data', 'certificates_legacy.csv');
    
    const pythonPath = getPythonPath(basePath);
    const pythonProcess = spawn(pythonPath, [pythonScript, filePath, '--csv', csvPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 15000 // 15 second timeout for legacy verification (optimized)
    });
    
    let output = '';
    let error = '';
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Timeout during legacy verification'));
      }
    }, 15000);
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      
      try {
        const result = JSON.parse(output);
        resolve({
          status: result.status,
          message: result.message,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        reject(new Error('Failed to parse legacy verification result'));
      }
    });
    
    pythonProcess.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      reject(new Error(`Legacy verification failed: ${err.message}`));
    });
  });
}

// Function to send email for invalid certificates
async function sendInvalidCertificateEmail(verificationResult, fileName) {
  if (!emailTransporter) {
    console.log('Email service not configured - skipping invalid certificate notification');
    return;
  }

  const status = verificationResult.status;
  const pipeline = verificationResult.pipeline || 'unknown';
  const message = verificationResult.message || 'No specific reason provided';
  
  // Determine the subject based on status
  let subject = 'Certificate Verification Failed';
  if (status === 'invalid') {
    subject = 'Invalid Certificate Detected';
  } else if (status === 'mismatch') {
    subject = 'Certificate Data Mismatch Detected';
  } else if (status === 'error') {
    subject = 'Certificate Verification Error';
  }

  // Create detailed email content
  let emailContent = `
Certificate Verification Alert

File: ${fileName}
Status: ${status.toUpperCase()}
Pipeline: ${pipeline}
Reason: ${message}
Timestamp: ${new Date().toISOString()}

Verification Details:
`;

  // Add pipeline-specific details
  if (verificationResult.fields) {
    emailContent += `
Field Comparison:
`;
    Object.entries(verificationResult.fields).forEach(([field, data]) => {
      emailContent += `  ${field}: ${data.match ? 'MATCH' : 'MISMATCH'}
    Database: ${data.db}
    OCR: ${data.ocr}
`;
    });
  }

  if (verificationResult.verification_details) {
    emailContent += `
Detailed Verification:
`;
    Object.entries(verificationResult.verification_details).forEach(([section, details]) => {
      emailContent += `  ${details.title || section}: ${details.status || 'unknown'}
    ${details.message || 'No additional details'}
`;
    });
  }

  emailContent += `
Processing Time: ${verificationResult.processing_time || 'unknown'}ms

This is an automated notification from the Certificate Verification System.
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ALERT_EMAIL || process.env.EMAIL_USER, // Use ALERT_EMAIL if configured, otherwise use EMAIL_USER
    subject: subject,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>')
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`Invalid certificate email sent for: ${fileName} (${status})`);
  } catch (error) {
    console.error('Failed to send invalid certificate email:', error);
    throw error;
  }
}

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    if (!emailTransporter) {
      return res.status(503).json({ 
        success: false, 
        message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
      });
    }

    const { to, subject, body, attachments } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, body' 
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: body,
      attachments: attachments ? attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64',
        contentType: att.contentType
      })) : []
    };

    await emailTransporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
