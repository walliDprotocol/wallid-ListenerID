'use strict';

const https = require('https');

function storeID (idt, wa, cb) {
  https.get('https://storeid.caixamagica.pt/api/v1/data?idt=' + idt + '&wa=' + wa, (res) => {
    let data = '';

    res.on('data', (r) => {
      data += r;
    });

    res.on('end', () => {
      let parsed = JSON.parse(data);
      // If parsed data is empty, return 'STOREID_FAIL'
      let result = (parsed.data === null) ? 'STOREID_FAIL' : parsed.data[0].verify_id;

      cb(null, result);
    });

    res.on('error', (err) => {
      console.log('Error: ', err);
    });
  });
}

module.exports = storeID;
