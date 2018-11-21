'use strict';

const request = require('request');
const settings = require('./settings.json');

function kyc(body, cb) {
  // Here go the request to KYC to get validate the OPID
  request.post({ url: settings.kyc_url, json: true, body: body }, function(err, res, body) {
    if (err) {
      // return to event RequestPayment the error
      cb(err, null);

    } else {
      // return to event RequestPayment the result
      cb(null, body.data);
    }
  });
}

module.exports = kyc;
