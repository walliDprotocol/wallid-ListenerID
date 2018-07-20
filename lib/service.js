var Web3 = require('web3');
var request = require('request');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var contract = require('truffle-contract');
var util = require('util');
var tx = require('ethereumjs-tx');
var meta_info = require('./definition.json');
var async = require('async');
var interface_abi = meta_info.abi;
var provider = 'http://' + process.env.ETH_NODE_RPC_SERVICE_HOST + ':' + process.env.ETH_NODE_RPC_SERVICE_PORT;

/** websocket tested for event */
//var ws_provider = 'wss://rinkeby.infura.io/ws'
//var web3 = new Web3(new Web3.providers.WebsocketProvider(ws_provider));

//wss://mainnet.infura.io/ws | tested and working
//wss://rinkeby.infura.io/ws

//local :  http://127.0.0.1:8545
//local websocket : ws://127.0.0.1:8546
//infura https://rinkeby.infura.io/cFPVC7DEylasScNoPTYP

var web3 = new Web3(
  new Web3.providers.HttpProvider(provider)
);

var AUTH_INTERVAL = 1000 * 60 * 3;

var unlockPassword = '3M^s4^q%2PZ6ohGvZ^YF';

var address_wallet = meta_info.wallet_adress;
//adress from last contract!
var contract_addr = meta_info.contract_adress;
//My key from metamask
var key = meta_info.private_key;

var econtract = new web3.eth.Contract(interface_abi, contract_addr, {
  from: address_wallet, // default from address
  gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case

});

var SmartCaller = function () {
  this.init();
  this.auth_interval = null;
}

SmartCaller.prototype = {
  init: function () {

    console.log('Init Smart Caller Instance');
    //web3.eth.personal.unlockAccount(eth.accounts[0], "BENFICA")

    /** PERFORME AUTH IN A LOOP TO ENSURE EVENT WAS FIRED */
    this.auth_interval = setInterval(() => {
      console.log('will do unlock account ')
      web3.eth.personal.unlockAccount(address_wallet, unlockPassword)
        .then(result => {
          util.log(`>>>>> Unlock account with sucess ? ${result}`);

        }, error => {
          console.error('Error unlockAccount ', error);

        });
    }, AUTH_INTERVAL);


  },
  acceptToken: function (userAddress, idt, opid, sdkey) {
    console.log('AcceptToken smartCaller method');

    async.waterfall([

      function (next) {

        web3.eth.personal.unlockAccount(address_wallet, unlockPassword)
          .then(result => {
            util.log(`>>>>> Unlock account with sucess ? ${result}`);
            next(null);

          }, error => {
            console.error('Error unlockAccount ', error);
            next(error, null);
          });
      },
      function (next) {

        econtract.methods.acceptedToken(userAddress, idt, opid, sdkey).send({
          from: address_wallet,
          gasPrice: '20000000000',
          gas: 1000000
        }, function (error, result) {
          if (error) {
            console.error('error exection the contract [acceptedToken]', error);
          } else {
            util.log(`>>>>> SUCCESS CALLING  [acceptedToken]s ? ${result}`);
          }
          next(error, result);
        });
      }

    ], (err, data) => {
      if (err) {
        console.error('>>> ERROR CALLING acceptToken ', error);
      }
    });

  },
  /** storeId provider is replying with user data */
  acceptedUserData: function (userAddress, idt, opid, verifyId) {
    console.log('acceptedUserData smartCaller method');

    async.waterfall([
        (next) => {
          web3.eth.personal.unlockAccount(address_wallet, unlockPassword)
            .then(result => {
              util.log(`>>>>> Unlock account with sucess ? ${result}`);
              next(null);

            }, error => {
              console.error('Error unlockAccount ', error);
              next(error, null);
            });
        },
        (next) => {
          econtract.methods.acceptedUserData(userAddress, idt, opid, verifyId).send({
            from: address_wallet,
            gasPrice: '20000000000',
            gas: 2000000
          }, function (error, result) {
            if (error) {
              console.error('error exection the contract [acceptedUserData]', error);
            } else {
              console.log('SUCCESS CALLING  [acceptedUserData]', result)
            }

            next(error, result);
          });
        }
      ],
      function (err, data) {
        if (err) {
          console.error('>>> ERROR CALLING acceptedUserData ', error);
        }
      });


  },
}

module.exports = new SmartCaller();
