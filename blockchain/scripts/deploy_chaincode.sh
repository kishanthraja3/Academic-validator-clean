#!/bin/bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
peer lifecycle chaincode install fabric/chaincode/pdfhash.tar.gz
# Add other peer CLI commands for approve and commit as per Fabric docs
