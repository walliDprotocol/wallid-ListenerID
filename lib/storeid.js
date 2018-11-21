'use strict';

const request = require('request');
const settings = require('./settings.json');

function storeID (idt, wa, cb) {
  // Here go the request to StoreID to get the VerifyID data of the user
  request.get({ url: settings.storeid_url + '?idt=' + idt + '&wa=' + wa, json: true }, function(err, res, body) {
    if (err) {
      // return to event RequestVerifyId the error
      cb(err, null);

    } else {
      // If parsed data is empty, return 'STOREID_FAIL'
      let result = (body.data == null) ? 'STOREID_FAIL' : body.data[0].verifyID;
      // return to event RequestVerifyId the result
      cb(null, result);
    }
  });
}

module.exports = storeID;
