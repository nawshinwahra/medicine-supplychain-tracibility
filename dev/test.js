
const Blockchain =require('./blockchain');
const testblockchain = new Blockchain();

//testblockchain.createNewBlock(2389, 'OIN0JKGJDJSLUI9', '90ANSJUGKJHLHOKGDN');
//console.log(testblockchain);
//testblockchain.createNewTransaction(100, 'ALEXGDKDDRTWU969573FGDHJF','JENNYKHJKJHJDHGF9508lKJHO');
//testblockchain.createNewBlock(2119, 'OIJHFKGJLGJDJSLUI9', 'HGFKGHLGKLHOKGDN');
//console.log(testblockchain.chian[1]);
//console.log(testblockchain);

/*const previousBlockHash = 'HVKDSYFLHGJDYSYJKGL';
const currentBlockData = [

    {
    amount: 10,
    sender: 'JGKFJVNGJFKLYKYDRSUKHFLG',
    recipient: 'KJGKJFJGLJLKFYJDKYLOTI'
    },
    {
        amount: 100,
        sender: 'JENNYKJHLHJFYKYDRSUKHFLG',
        recipient: 'KUTTJHKIYLKFYJDKYLOTI'
    },
    {
        amount: 15,
        sender: 'GHFKGFKHLYKYDRSUKHFLG',
        recipient: 'GFJKLOITYFOUFYFYJDKYLOTI'
    }
];*/

//console.log(testblockchain.hashBlock(previousBlockHash, currentBlockData,116350));
//console.log(testblockchain.proofOfWork(previousBlockHash, currentBlockData));


//const nonce = 100;

//console.log(testblockchain.hashBlock(previousBlockHash, currentBlockData, nonce));
//console.log(testblockchain);
const bc1 = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1567001093672,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1567001261992,
    "transactions": [
    {
    "amount": 450,
    "sender": "NVKCHGJKGCKHLKH",
    "recipient": "CJVBJLKHJCHZFXFGKG",
    "TransactionId": "27fb4d60c99d11e9bdf4c57cbe88eccc"
    }
    ],
    "nonce": 93169,
    "hash": "0000e6f6cbdcd864e126d24a0212e5953c90bece98ee2c0377b185bfbc89fec",
    "previousBlockHash": "0"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "cec48ea0c99c11e9bdf4c57cbe88eccc",
    "TransactionId": "335bbf50c99d11e9bdf4c57cbe88eccc"
    }
    ],
    "currentNodeUrl": "http://localhost:3005",
    "networkNodes": []
    };

   // console.log(bc1.chain);

   console.log('VALID: ', testblockchain.chainIsValid(bc1.chain)); 