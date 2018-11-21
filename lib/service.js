const Web3 = require('web3');
const lightwallet = require('eth-lightwallet');
const txutils = lightwallet.txutils;
const contract = require('truffle-contract');
const util = require('util');
const Tx = require('ethereumjs-tx');
const meta_info = require('./definition.json');
const settings = require('./settings.json');
const async = require('async');
const CryptoJS = require('crypto-js');
const interface_abi = meta_info.abi;
const api_key = process.env.API_KEY;
const provider = 'https://rinkeby.infura.io/v3/' + api_key;
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const address_wallet = settings.wallet_adress;
const contract_addr = meta_info.contract_adress;
const key = process.env.ETH_PRIVKEY;
const privateKey = new Buffer(key, 'hex');
const econtract = new web3.eth.Contract(interface_abi, contract_addr);

function sendTx(functionName, args, gasLimit, callback) {
  const types = ['address', 'bytes', 'uint256', 'bytes'];
  const encoded_tx = functionName(args[0], args[1], args[2], args[3]).encodeABI();
  let nonce;
  let serializedTx;
  let txHash;

  async.waterfall([
    (next) => {
      web3.eth.getTransactionCount(address_wallet, function(err, count) {
        if (err) {
          next(err, null);

        } else {
          nonce = web3.utils.numberToHex(count);
          next(null);
        }
      });

    }, (next) => {
      web3.eth.getGasPrice(function(err, price) {
        if (err) {
          next(err, null);

        } else {
          let gasPrice = web3.utils.numberToHex(Number(price) * 1.40);
          let gasLimitHex = web3.utils.numberToHex(gasLimit);
          let rawTx = { 'nonce': nonce, 'gasPrice': gasPrice, 'gasLimit': gasLimitHex, 'from': address_wallet, 'to': contract_addr, 'data': encoded_tx };
          const tx = new Tx(rawTx);
          tx.sign(privateKey);
          serializedTx = tx.serialize();
          next(null);
        }
      });

    }, (next) => {
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (err) {
          next(err, null);

        } else {
          txHash = hash;
          next(null);
        }
      });
    }

  ], function(error) {
    callback(error, txHash);
  });
}

let SmartCaller = function() {};

SmartCaller.prototype = {
  RequestPayment: function (userAddress, idt, opid, sdkey) {
    console.log('RequestPayment smartCaller method');
    let args = [ userAddress, idt, opid, sdkey ];
    let gasLimit = 1000000;

    sendTx(econtract.methods.acceptedToken, args, gasLimit, function(err, result) {
      if (err) {
        console.error('error executing [acceptedToken]:', err);

      } else {
        util.log('SUCCESS CALLING [acceptedToken]:', result);
      }
    });
  },
  /** storeId provider is replying with user data */
  RequestVerifyId: function (userAddress, idt, opid, verifyId) {
    console.log('RequestVerifyId smartCaller method');
    let args = [ userAddress, idt, opid, verifyId ];
    let gasLimit = 3000000;

    sendTx(econtract.methods.acceptedUserData, args, gasLimit, function(err, result) {
      if (err) {
        console.error('error executting [acceptedUserData]:', err);

      } else {
        util.log('SUCCESS CALLING [acceptedUserData]:', result);
      }
    });
  }
}

module.exports = new SmartCaller();
