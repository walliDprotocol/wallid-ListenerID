var Web3 = require('web3');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var contract = require('truffle-contract');
var util = require('util');
var Tx = require('ethereumjs-tx');
var meta_info = require('./definition.json');
var async = require('async');
var CryptoJS = require('crypto-js');
var interface_abi = meta_info.abi;
var provider = 'https://rinkeby.infura.io/v3/404204cd944c4d5d9bcca4f4d89f7f58';
var web3 = new Web3(new Web3.providers.HttpProvider(provider));

var address_wallet = meta_info.wallet_adress;
// adress from last contract!
var contract_addr = meta_info.contract_adress;
var key = process.env.ETH_PRIVKEY;
var privateKey = new Buffer(key, 'hex');
var econtract = new web3.eth.Contract(interface_abi, contract_addr);

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
  acceptToken: function (userAddress, idt, opid, sdkey) {
    console.log('AcceptToken smartCaller method');
    let args = [ userAddress, idt, opid, sdkey ];
    let gasLimit = 1000000;

    sendTx(econtract.methods.acceptedToken, args, gasLimit, function(err, result) {
      if (err) {
        console.error('error exection the contract [acceptedToken]', err);

      } else {
        util.log(`>>>>> SUCCESS CALLING  [acceptedToken]s ? ${result}`);
      }
    });
  },
  /** storeId provider is replying with user data */
  acceptedUserData: function (userAddress, idt, opid, verifyId) {
    console.log('acceptedUserData smartCaller method');
    let args = [ userAddress, idt, opid, verifyId ];
    let gasLimit = 3000000;

    sendTx(econtract.methods.acceptedUserData, args, gasLimit, function(err, result) {
      if (err) {
        console.error('error exection the contract [acceptedUserData]', err);

      } else {
        console.log('SUCCESS CALLING  [acceptedUserData]', result);
      }
    });
  }
}

module.exports = new SmartCaller();
