'use strict';

const request = require('request');
const settings = require('./settings.json');

function kyc(body, cb) {
  // Here go the request to StoreID to get the VerifyID data of the user
  request.post({ url: settings.kyc_url, json: true, body: body }, function(err, res, body) {
    if (err) {
      cb(err, null);

    } else {
      cb(null, body.data);
    }
  });
}

module.exports = kyc;
