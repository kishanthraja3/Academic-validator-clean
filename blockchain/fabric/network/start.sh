#!/bin/bash
export FABRIC_CFG_PATH=${PWD}
docker-compose -f docker-compose.yaml up -d
./generate_crypto.sh
./create_channel.sh
echo "Hyperledger Fabric network started."
