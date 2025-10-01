#!/bin/bash

# Blockchain Setup Script for Certificate Verification System
echo "🔗 Setting up Blockchain Network..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Ubuntu/Debian: sudo apt install docker.io"
    echo "   Follow Docker installation guide for your OS"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker service:"
    echo "   sudo systemctl start docker"
    echo "   sudo usermod -aG docker \$USER"
    echo "   (You may need to log out and back in)"
    exit 1
fi

echo "✅ Docker is installed and running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"

# Navigate to blockchain directory
cd blockchain/fabric-samples/test-network

# Check if network.sh exists
if [ ! -f "network.sh" ]; then
    echo "❌ network.sh not found. Please ensure fabric-samples is properly set up."
    exit 1
fi

echo "📋 Available blockchain commands:"
echo ""
echo "To start the blockchain network:"
echo "  ./network.sh up createChannel -ca"
echo ""
echo "To deploy the PDF hash chaincode:"
echo "  ./network.sh deployCC -ccn pdfhash -ccp ../pdfhash-chaincode -ccl go"
echo ""
echo "To stop the blockchain network:"
echo "  ./network.sh down"
echo ""
echo "To clean up everything:"
echo "  ./network.sh down -v"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start blockchain network"
echo "2) Deploy PDF hash chaincode"
echo "3) Stop blockchain network"
echo "4) Full setup (start + deploy)"
echo "5) Clean up everything"
echo "6) Just show instructions"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "🚀 Starting blockchain network..."
        ./network.sh up createChannel -ca
        ;;
    2)
        echo "📦 Deploying PDF hash chaincode..."
        ./network.sh deployCC -ccn pdfhash -ccp ../pdfhash-chaincode -ccl go
        ;;
    3)
        echo "🛑 Stopping blockchain network..."
        ./network.sh down
        ;;
    4)
        echo "🚀 Starting blockchain network..."
        ./network.sh up createChannel -ca
        echo "📦 Deploying PDF hash chaincode..."
        ./network.sh deployCC -ccn pdfhash -ccp ../pdfhash-chaincode -ccl go
        ;;
    5)
        echo "🧹 Cleaning up everything..."
        ./network.sh down -v
        ;;
    6)
        echo "📖 Setup Instructions:"
        echo ""
        echo "1. Start the network:"
        echo "   ./network.sh up createChannel -ca"
        echo ""
        echo "2. Deploy the chaincode:"
        echo "   ./network.sh deployCC -ccn pdfhash -ccp ../pdfhash-chaincode -ccl go"
        echo ""
        echo "3. Test the chaincode (optional):"
        echo "   docker exec cli bash -c 'export FABRIC_CFG_PATH=/fabric-samples/test-network/compose/docker/peercfg && export CORE_PEER_LOCALMSPID=\"Org1MSP\" && export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp && export CORE_PEER_ADDRESS=peer0.org1.example.com:7051 && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem && peer chaincode query -C mychannel -n pdfhash -c \"{\\\"Args\\\":[\\\"VerifyPDF\\\",\\\"test_hash\\\"]}\"'"
        echo ""
        echo "4. To stop:"
        echo "   ./network.sh down"
        echo ""
        echo "5. To clean everything:"
        echo "   ./network.sh down -v"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Blockchain setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure the blockchain network is running"
echo "2. Start the backend server: cd backend && npm start"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🔗 The blockchain verification will work automatically once the network is up!"
