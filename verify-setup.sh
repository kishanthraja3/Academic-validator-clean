#!/bin/bash

# Verification Script for Certificate Verification System
echo "🔍 Verifying Certificate Verification System Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command availability
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

# Function to check if port is in use
check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Port $1 is in use${NC}"
        return 1
    fi
}

# Function to check if directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ Directory $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ Directory $1 is missing${NC}"
        return 1
    fi
}

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ File $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ File $1 is missing${NC}"
        return 1
    fi
}

echo ""
echo "📋 Checking Prerequisites..."

# Check required commands
check_command "node" || echo "   Install: https://nodejs.org/"
check_command "python3" || echo "   Install: sudo apt install python3"
check_command "docker" || echo "   Install: https://docs.docker.com/get-docker/"
check_command "docker-compose" || echo "   Install: https://docs.docker.com/compose/install/"

echo ""
echo "📁 Checking Project Structure..."

# Check main directories
check_directory "frontend"
check_directory "backend"
check_directory "blockchain"
check_directory "docs"

# Check important files
check_file "setup.sh"
check_file "blockchain-setup.sh"
check_file "README.md"
check_file ".gitignore"
check_file "frontend/package.json"
check_file "backend/package.json"

echo ""
echo "🐍 Checking Python Setup..."

# Check Python virtual environment
if [ -d "backend/certificate_validator/venv" ]; then
    echo -e "${GREEN}✅ Python virtual environment exists${NC}"
    
    # Check if requirements.txt exists
    if [ -f "backend/certificate_validator/requirements.txt" ]; then
        echo -e "${GREEN}✅ requirements.txt exists${NC}"
    else
        echo -e "${RED}❌ requirements.txt is missing${NC}"
    fi
else
    echo -e "${RED}❌ Python virtual environment is missing${NC}"
    echo "   Run: ./setup.sh to create it"
fi

echo ""
echo "🔗 Checking Blockchain Setup..."

# Check blockchain files
check_file "blockchain/fabric-samples/test-network/network.sh"
check_file "blockchain/fabric-samples/test-network/compose/docker/peercfg/core.yaml"

# Check if Docker containers are running
if docker ps --format "table {{.Names}}" | grep -q "cli"; then
    echo -e "${GREEN}✅ Blockchain CLI container is running${NC}"
else
    echo -e "${YELLOW}⚠️  Blockchain CLI container is not running${NC}"
    echo "   Run: ./blockchain-setup.sh"
fi

if docker ps --format "table {{.Names}}" | grep -q "peer0.org1.example.com"; then
    echo -e "${GREEN}✅ Blockchain peer container is running${NC}"
else
    echo -e "${YELLOW}⚠️  Blockchain peer container is not running${NC}"
    echo "   Run: ./blockchain-setup.sh"
fi

echo ""
echo "📦 Checking Dependencies..."

# Check if node_modules exist
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend dependencies missing${NC}"
    echo "   Run: cd frontend && npm install"
fi

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend dependencies missing${NC}"
    echo "   Run: cd backend && npm install"
fi

echo ""
echo "🔧 Checking Configuration Files..."

# Check configuration files
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env file is missing${NC}"
    echo "   Run: ./setup.sh to create it"
fi

if [ -f "backend/certificate_validator/config.env" ]; then
    echo -e "${GREEN}✅ Database config file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database config file is missing${NC}"
    echo "   Copy: backend/certificate_validator/config.env.example to config.env"
fi

echo ""
echo "🌐 Checking Ports..."

# Check if ports are available
check_port "3001"  # Backend
check_port "5173"  # Frontend (Vite default)
check_port "7050"  # Orderer
check_port "7051"  # Peer Org1
check_port "9051"  # Peer Org2

echo ""
echo "🧪 Testing Blockchain Connection..."

# Test blockchain connection
if docker ps --format "table {{.Names}}" | grep -q "cli"; then
    echo "Testing blockchain query..."
    if docker exec cli bash -c 'export FABRIC_CFG_PATH=/fabric-samples/test-network/compose/docker/peercfg && export CORE_PEER_LOCALMSPID="Org1MSP" && export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp && export CORE_PEER_ADDRESS=peer0.org1.example.com:7051 && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem && peer version' &>/dev/null; then
        echo -e "${GREEN}✅ Blockchain connection test successful${NC}"
    else
        echo -e "${RED}❌ Blockchain connection test failed${NC}"
        echo "   Check blockchain network status"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test blockchain - CLI container not running${NC}"
fi

echo ""
echo "📋 Summary:"
echo "============"
echo ""
echo "🚀 To start the application:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access points:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001"
echo ""
echo "🔧 If issues found:"
echo "- Run: ./setup.sh to fix dependency issues"
echo "- Run: ./blockchain-setup.sh to fix blockchain issues"
echo ""
echo "✅ Verification completed!"
