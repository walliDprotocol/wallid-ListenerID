'use strict';

const http = require('http');

function storeID (idt, wa, cb) {
  http.get('https://storeid.caixamagica.pt/api/v1/data?idt=' + idt + '&wa=' + wa, (res) => {
    let data = '';

    res.on('data', (r) => {
      data += r;
    });

    res.on('end', () => {
      var x = JSON.parse(data);
      cb(null, JSON.stringify(x.data[0].verify_id));
    });

    res.on('error', (err) => {
      console.log('Error: ', err);
    });
  });
}

module.exports = storeID;
