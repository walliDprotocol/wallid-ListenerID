var Web3 = require('web3');
var request = require('request');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var contract = require('truffle-contract');
var util = require('util');
var tx = require('ethereumjs-tx');

var SmartCaller = require('./service')
var meta_info = require('./definition.json');
var interface_abi = meta_info.abi;
var storeID = require('./storeid');
var provider = 'ws://' + process.env.ETH_NODE_WS_SERVICE_HOST + ':' + process.env.ETH_NODE_WS_SERVICE_PORT;

/** websocket tested for event */
//var ws_provider = 'wss://rinkeby.infura.io/ws'
//var web3 = new Web3(new Web3.providers.WebsocketProvider(ws_provider));

//wss://mainnet.infura.io/ws | tested and working
//wss://rinkeby.infura.io/ws

//local :  http://127.0.0.1:8545
//local websocket : ws://127.0.0.1:8546
//infura https://rinkeby.infura.io/cFPVC7DEylasScNoPTYP

var web3 = new Web3(
    new Web3.providers.WebsocketProvider(provider)
);

var address_wallet =  meta_info.wallet_adress;
//adress from last contract!
var contract_addr = meta_info.contract_adress;
//My key from metamask
var key = meta_info.private_key;

var econtract = new web3.eth.Contract(interface_abi, contract_addr, {
    from: address_wallet, // default from address
    gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case
});

console.log("Starting listner events ...");
/*
  Event return newPayment after just call method!!
*/
var newPaymentEvent = econtract.events.RequestPayment({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
}, function (error, result) {
    console.log('EVENT  RequestPayment : -> ');
    console.log('VALUES ->> ', result.returnValues);

    if (error) {
        console.error('ERROR Invoke contracts ', error)
    } else {
        if (result !== undefined) {
            var rData = result.returnValues[0]
            console.log('arg 0 ', result.returnValues[0])
            console.log('arg 1 ', result.returnValues[1])
            console.log('arg 2 ', result.returnValues[2])
            //var args = result.returnValues;
            //args["_txn"] = result.transactionHash;

            console.log('1. will call smartCaller acceptToken.')
            SmartCaller.acceptToken(result.returnValues[0], result.returnValues[1], result.returnValues[2], '0x43435f5054');
        }
    }
});

/**
 * Request VerifyId event Handler
 */
var RequestVerifyId = econtract.events.RequestVerifyId({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
}, function (error, result) {
    console.log('EVENT  RequestVerifyId : -> was FIRED');
    //console.log('VALUS ->> ', result.returnValues);

    console.log('2. will call smartCaller acceptToken! ...')
    /**
     * Call storeID API
     */
    let idt = web3.utils.hexToString(result.returnValues[1]);

    storeID(idt, result.returnValues[0], (err, data) => {
      let verifyID = web3.utils.toHex(data);
      SmartCaller.acceptedUserData(result.returnValues[0], result.returnValues[1], result.returnValues[2], verifyID);
    });
});

/**
 * Request DataId event Handler
 * Should be implement in client browser!!
 *
 */
var DataId = econtract.events.EventDataId({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
}, function (error, result) {
    console.log('EventDataId was called');
    console.log('3. OPERATION SUCCESS GET NEXT TASK!!!!');
    //console.log('VALUES ->> ', result.returnValues);
});
