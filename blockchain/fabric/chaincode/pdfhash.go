package main

import (
    "encoding/json"
    "fmt"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)


type SmartContract struct {
    contractapi.Contract
}

func (s *SmartContract) StorePDF(ctx contractapi.TransactionContextInterface, hash string, metadata string) error {
    return ctx.GetStub().PutState(hash, []byte(metadata))
}

func (s *SmartContract) VerifyPDF(ctx contractapi.TransactionContextInterface, hash string) (string, error) {
    data, err := ctx.GetStub().GetState(hash)
    if err != nil || data == nil {
        return "", fmt.Errorf("Invalid,Hash not found on blockchain")
    }

    response := struct {
        Hash     string `json:"hash"`
        Metadata string `json:"metadata"`
    }{
        Hash:     hash,
        Metadata: string(data),
    }
    jsonResp, err := json.Marshal(response)
    if err != nil {
        return "", err
    }
    return string(jsonResp), nil
}


func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        panic(err.Error())
    }
    if err := chaincode.Start(); err != nil {
        panic(err.Error())
    }
}
