from hfc.fabric import Client as FabricClient
import sys
import json

def store_pdf_hash(hash_value, metadata):
    c = FabricClient('fabric/network/connection-org1.json')
    c.new_channel('mychannel')
    response = c.chaincode_invoke(
        requestor='User1',
        channel_name='mychannel',
        peers=['peer0.org1.example.com'],
        args=[hash_value, metadata],
        cc_name='pdfhash', fcn='StorePDF',
        wait_for_event=True
    )
    print(response)

def verify_pdf_hash(hash_value):
    c = FabricClient('fabric/network/connection-org1.json')
    c.new_channel('mychannel')
    response = c.chaincode_query(
        requestor='User1',
        channel_name='mychannel',
        peers=['peer0.org1.example.com'],
        args=[hash_value],
        cc_name='pdfhash', fcn='VerifyPDF'
    )
    print(response)

if __name__ == "__main__":
    action = sys.argv[1]
    if action == 'store':
        store_pdf_hash(sys.argv[2], sys.argv[3])
    else:
        verify_pdf_hash(sys.argv[2])
