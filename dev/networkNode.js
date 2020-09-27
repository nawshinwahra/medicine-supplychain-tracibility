const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain =require('./blockchain');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');
const port = process.argv[2];
const rp = require('request-promise');


const testBlockchain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

 //get entire blockchain
app.get('/blockchain', function (req, res) {
    res.send(testBlockchain);
  
});
//create new transaction
app.post('/transaction', function(req, res) {

	const newTransaction = req.body;

	const blockIndex = testBlockchain.addTransactionToPendingTransactions(newTransaction);

	res.json({ note: `Transaction will be added in block ${blockIndex}.` });





    //const blockIndex = testBlockchain.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient); 
    //res.json({ note: `Transaction will be added in block ${blockIndex}.`});
    //console.log(req.body);
    //res.send(`The amount of transaction is ${req.body.amount} `); bitcoin

});
app.post('/transaction/broadcast', function(req, res) {
   const newTransaction = testBlockchain.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
   testBlockchain.addTransactionToPendingTransactions(newTransaction);
   const requestPromises = [];
   testBlockchain.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
          uri: networkNodeUrl + '/transaction',
          method: 'POST',
          body: newTransaction,
          json: true
      };
     requestPromises.push(rp(requestOptions));
   });
   Promise.all(requestPromises)
   .then(data => {
       
            res.json({ note: 'Trannsaction created and broadcast successfully.' }); 
   });
});




//mine a block
app.get('/mine', function(req, res)   {
    const lastBlock = testBlockchain.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
          transactions: testBlockchain.pendingTransactions,
          index: lastBlock['index'] + 1
 
    };
    const nonce = testBlockchain.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = testBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
     //testBlockchain.createNewTransaction(0, "12.5", nodeAddress);

    const newBlock = testBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);
    const requestPromises = [];
    testBlockchain.networkNodes.forEach(networkNodeUrl => {
       
       const requestOptions = {
           uri: networkNodeUrl + '/receive-new-block',
           method: 'POST',
           body: {newBlock: newBlock},
           json: true

       };
       requestPromises.push(rp(requestOptions));

    });

    Promise.all(requestPromises)
    .then(data => {
     const requestOptions ={
         uri: testBlockchain.currentNodeUrl + '/transaction/broadcast',
         method: 'POST',
         body: {
             amount: 12.5,
             sender: "00",
             recipient: nodeAddress
         },
         json: true
     };

       return rp(requestOptions);
    })
    .then(data => {
        res.json({
            note: "New block mined & broadcast successfully",
            block: newBlock
        });
    }); 
});

app.post('/receive-new-block', function(req , res){
    const newBlock = req.body.newBlock;
    const lastBlock = testBlockchain.getLastBlock();
    const correctHash = lastBlock.hash == newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 == newBlock['index'];
    if (correctHash && correctIndex){
        testBlockchain.chian.push(newBlock);
        testBlockchain.pendingTransactions = [];
        res.json({
            note: 'new block recived and acccepted.',
            newBlock: newBlock
        });
    } else {
        res.json({
            note:'new block rejected.', 
            newBlock: newBlock
        });
    }
});




//register a node andbroadcast it to the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (testBlockchain.networkNodes.indexOf(newNodeUrl) == -1) testBlockchain.networkNodes.push(newNodeUrl);



	const regNodesPromises = [];
	testBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true

		};



		regNodesPromises.push(rp(requestOptions));

	});



	Promise.all(regNodesPromises)

	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...testBlockchain.networkNodes, testBlockchain.currentNodeUrl ] },
			json: true

		};



		return rp(bulkRegisterOptions);

	})

	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });

	});

});



//register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = testBlockchain.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = testBlockchain.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) testBlockchain.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });

});

//register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {

	const allNetworkNodes = req.body.allNetworkNodes;

	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = testBlockchain.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = testBlockchain.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) testBlockchain.networkNodes.push(networkNodeUrl);

	});


	res.json({ note: 'Bulk registration successful.' });

});

// consensus

app.get('/consensus', function(req, res){
	const requestPromises = [];
	testBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true

		};
		requestPromises.push(rp(requestOptions));
	});
	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = testBlockchain.chian.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;
		blockchains.forEach(blockchain => {

			if (blockchain.chain.length > maxChainLength) {

				maxChainLength = blockchain.chain.length;

				newLongestChain = blockchain.chain;

				newPendingTransactions = blockchain.pendingTransactions;

			};

		});
	   if(!newLongestChain || (newLongestChain && !testBlockchain.chainIsValid(newLongestChain))) {
	   res.json({
		   note:'current chain has not been replaced.',
		   chain: testBlockchain.chain
	   });
	}
	    else {
		 testBlockchain.chian = newLongestChain;
		 testBlockchain.pendingTransactions = newPendingTransactions;
		 res.json({
			 note: 'this chain has been replaced.',
			 chain: testBlockchain.chain
		 });
    }
	});

});




/*
app.get('/consensus', function(req, res) {

	const requestPromises = [];

	testBlockchain.networkNodes.forEach(networkNodeUrl => {

		const requestOptions = {

			uri: networkNodeUrl + '/blockchain',

			method: 'GET',

			json: true

		};



		requestPromises.push(rp(requestOptions));

	});



	Promise.all(requestPromises)

	.then(blockchains => {

		const currentChainLength = testBlockchain.chain.length;

		let maxChainLength = currentChainLength;

		let newLongestChain = null;

		let newPendingTransactions = null;


		blockchains.forEach(blockchain => {

			//console.log(blockchain);
			//return false;
 
			if (blockchain.chain.length > maxChainLength) {

				maxChainLength = blockchain.chain.length;

				newLongestChain = blockchain.chain;

				newPendingTransactions = blockchain.pendingTransactions;

			};

		});





		if (!newLongestChain || (newLongestChain && !testBlockchain.chainIsValid(newLongestChain))) {

			res.json({

				note: 'Current chain has not been replaced.',

				chain: testBlockchain.chain

			});

		}

		else {

			testBlockchain.chain = newLongestChain;

			testBlockchain.pendingTransactions = newPendingTransactions;

			res.json({

				note: 'This chain has been replaced.',

				chain: testBlockchain.chain

			}); 

		}

	});

});

app.get('/block/:blockHash', function(req, res) { 

	const blockHash = req.params.blockHash;

	const correctBlock = testBlockchain.getBlock(blockHash);

	res.json({

		block: correctBlock

	});

});





// get transaction by transactionId

app.get('/transaction/:transactionId', function(req, res) {

	const transactionId = req.params.transactionId;

	const trasactionData = testBlockchain.getTransaction(transactionId);

	res.json({

		transaction: trasactionData.transaction,

		block: trasactionData.block

	});

});





// get address by address

app.get('/address/:address', function(req, res) {

	const address = req.params.address;

	const addressData = testBlockchain.getAddressData(address);

	res.json({

		addressData: addressData

	});

}); */



  
app.listen(port, function(){
    console.log( `listening on port ${port}....` );
    //console.log('Your app is listening on port ' + listener.address().port);
});