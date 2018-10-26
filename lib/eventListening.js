const Web3 = require('web3');
const lightwallet = require('eth-lightwallet');
const txutils = lightwallet.txutils;
const contract = require('truffle-contract');
const util = require('util');
const tx = require('ethereumjs-tx');
const SmartCaller = require('./service')
const meta_info = require('./definition.json');
const interface_abi = meta_info.abi;
const storeID = require('./storeid');
//wss://mainnet.infura.io/ws
//wss://rinkeby.infura.io/ws
const rinkeby_ws = "wss://rinkeby.infura.io/ws";
let provider = new Web3.providers.WebsocketProvider(rinkeby_ws);
let web3 = new Web3(provider);
let address_wallet;
let contract_addr;
let econtract;

function initListener() {
  address_wallet =  meta_info.wallet_adress;
  contract_addr = meta_info.contract_adress;
  econtract = new web3.eth.Contract(interface_abi, contract_addr);
  console.log('Starting listener events...');

  requestPaymentEvent();
  requestVerifyIdEvent();
  dataIdEvent();
}

// Event return newPayment after just call method!!
function requestPaymentEvent() {
  econtract.events.RequestPayment({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
  }, function (error, result) {
    console.log('EVENT: RequestPayment was called');
    console.log('VALUES ->> ', result.returnValues);

    if (error) {
      console.error('ERROR Invoke contracts: ', error)
    } else {
      if (result !== undefined) {
        let rData = result.returnValues[0];
        console.log('arg 0 ', result.returnValues[0]);
        console.log('arg 1 ', result.returnValues[1]);
        console.log('arg 2 ', result.returnValues[2]);

        console.log('1. will call smartCaller acceptToken.');
        SmartCaller.acceptToken(result.returnValues[0], result.returnValues[1], result.returnValues[2], '0x43435f5054');
      }
    }
  });
}

// Request VerifyId event Handler
function requestVerifyIdEvent() {
  econtract.events.RequestVerifyId({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
  }, function (error, result) {
    console.log('EVENT: RequestVerifyId was called');
    console.log('2. will call smartCaller acceptedUserData.');

    // Call storeID API
    let idt = web3.utils.hexToString(result.returnValues[1]);

    storeID(idt, result.returnValues[0], (err, data) => {
      let verifyID = web3.utils.toHex(data);
      SmartCaller.acceptedUserData(result.returnValues[0], result.returnValues[1], result.returnValues[2], verifyID);
    });
  });
}

// Request DataId event Handler
// Should be implement in client browser!!
function dataIdEvent() {
  econtract.events.EventDataId({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
  }, function (error, result) {
    console.log('EVENT: EventDataId was called');
    console.log('3. OPERATION SUCCESS GET NEXT TASK!!!!');
  });
}

initListener();

let interval =  setInterval(function() {
  provider = null;
  console.log('WS closed');
  console.log('Attempting to reconnect...');
  provider = new Web3.providers.WebsocketProvider(rinkeby_ws);
  console.log('WSS Reconnected');
  web3.setProvider(provider);
  initListener();
}, 1000 * 60 * 10);
