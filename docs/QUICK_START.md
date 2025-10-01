# 🚀 Quick Start Guide - Optimized Certificate Verification System

## ✅ **Fixed Setup Instructions**

The frontend uses `npm start` (not `npm run dev`). Here are the correct commands:

### 1. **Setup** (Windows):
```bash
# Run the setup script
setup-optimized.bat
```

### 2. **Start the System**:
```bash
# Terminal 1: Start backend server
npm start

# Terminal 2: Start frontend (in the same directory)
npm start
```

### 3. **Access the System**:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 🔧 **Alternative Setup (Manual)**

If the setup script doesn't work, you can set up manually:

### Backend Setup:
```bash
# Copy backend package.json
copy package-backend.json package.json

# Install backend dependencies
npm install

# Install Python dependencies
cd certificate_validator
pip install -r requirements.txt
cd ..

# Create directories
mkdir temp
mkdir certificate_validator\keys
mkdir certificate_validator\data
```

### Frontend Setup:
```bash
# Install frontend dependencies
npm install
```

---

## 🎯 **Correct Startup Commands**

### Option 1: Two Terminals
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend  
npm start
```

### Option 2: One Terminal (Background)
```bash
# Start backend in background
npm start &

# Start frontend
npm start
```

---

## 🚨 **Troubleshooting**

### If you get "Missing script: dev" error:
- Use `npm start` instead of `npm run dev`
- The frontend uses Vite with `npm start` command

### If backend fails to start:
- Make sure Python is installed
- Install Python dependencies: `pip install -r certificate_validator/requirements.txt`
- Check if port 3001 is available

### If frontend fails to start:
- Make sure all dependencies are installed: `npm install`
- Check if port 5173 is available
- Try clearing cache: `npm cache clean --force`

---

## 📊 **Performance Features Ready**

Once started, you'll have:
- ✅ **Unified verification pipeline**
- ✅ **Intelligent caching system**
- ✅ **Real-time performance monitoring**
- ✅ **Optimized file handling**
- ✅ **Timeout management**

Your optimized certificate verification system is ready! 🎉







