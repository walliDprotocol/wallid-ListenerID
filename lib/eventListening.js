const Web3 = require('web3');
const lightwallet = require('eth-lightwallet');
const txutils = lightwallet.txutils;
const contract = require('truffle-contract');
const util = require('util');
const tx = require('ethereumjs-tx');
const SmartCaller = require('./service')
const meta_info = require('./definition.json');
const settings = require('./settings.json');
const interface_abi = meta_info.abi;
const storeID = require('./storeid');
const kyc = require('./kyc');
//wss://mainnet.infura.io/ws
//wss://rinkeby.infura.io/ws
const rinkeby_ws = "wss://rinkeby.infura.io/ws";
let provider = new Web3.providers.WebsocketProvider(rinkeby_ws);
let web3 = new Web3(provider);
let address_wallet;
let contract_addr;
let econtract;
let nonce;
let nonceHex;

function listenEvent(eventName, callback) {
  econtract.events[eventName]({
    fromBlock: 5424000,
    address: '<address>',
    toBlock: 'latest'
  }, function (err, result) {
    console.log('EVENT:', eventName, 'was called');

    if (err) {
      console.error('ERROR Invoke contract: ', err);

    } else {
      if (result !== undefined) {
        callback(result);
      }
    }
  });
}

function initListener() {
  SmartCaller.createNonce(function(result) {
    nonce = result;
    console.log('nonce criado: ', nonce);
  });

  address_wallet =  settings.wallet_adress;
  contract_addr = meta_info.contract_adress;
  econtract = new web3.eth.Contract(interface_abi, contract_addr);
  console.log('Starting listener events...');

  if (settings.is_kyc_listener) {
    // Request RequestPayment event handler
    listenEvent('RequestPayment', (result) => {
      console.log('opid: ', result.returnValues[2]);

      let body = {
        idt: web3.utils.hexToString(result.returnValues[1]),
        wa: result.returnValues[0],
        opid: result.returnValues[2]
      }

      console.log('Will call KYC service');
      kyc(body, (err, data) => {
        if (err) {
          console.error('ERROR when requesting data to KYC: ', err);

        } else {
          console.log('called');
          console.log('returned: ', data);
          if (data === true) {
            nonceHex = web3.utils.numberToHex(nonce);
            console.log('nonce enviado: ', nonce);
            nonce++;
            console.log('true');
            console.log('Will call smartCaller RequestPayment');
            // SmartCaller.RequestPayment(userAddress, idt, opid, sdkey);
            SmartCaller.RequestPayment(result.returnValues[0], result.returnValues[1], result.returnValues[2], '0x43435f5054', nonceHex);
          }
        }
      });
    });
  }

  if (settings.is_storeid_listener) {
    // Request VerifyId event handler
    listenEvent('RequestVerifyId', (result) => {
      // Call storeID API
      let idt = web3.utils.hexToString(result.returnValues[1]);
      console.log('opid: ', result.returnValues[2]);

      console.log('Will call StoreID');
      storeID(idt, result.returnValues[0], (err, data) => {
        if (err) {
          console.error('ERROR when requesting data to StoreID: ', err);

        } else {
          console.log('Will call smartCaller RequestVerifyId');
          let verifyID = web3.utils.toHex(data);
          nonceHex = web3.utils.numberToHex(nonce);
          console.log('nonce enviado: ', nonce);
          nonce++;
          // SmartCaller.RequestVerifyId(userAddress, idt, opid, verifyId);
          SmartCaller.RequestVerifyId(result.returnValues[0], result.returnValues[1], result.returnValues[2], verifyID, nonceHex);
        }
      });
    });
  }
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
