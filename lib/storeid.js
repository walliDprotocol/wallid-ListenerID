'use strict';

const https = require('https');

function storeID (idt, wa, cb) {
  https.get('https://storeid.caixamagica.pt/api/v1/data?idt=' + idt + '&wa=' + wa, (res) => {
    let data = '';

    res.on('data', (r) => {
      data += r;
    });

    res.on('end', () => {
      var x = JSON.parse(data);

      if (x.data === null) {
        cb(null, 'STOREID_FAIL');
      } else {
        cb(null, x.data[0].verify_id);
      }
    });

    res.on('error', (err) => {
      console.log('Error: ', err);
    });
  });
}

module.exports = storeID;
