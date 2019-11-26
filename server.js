const express = require('express');
const serveStatic = require("serve-static")
const path = require('path');
let fs = require('fs')
// let config = require('./src/config')
const SERVER_TIMEOUT_MS = 20000;
const PORT = process.env.PORT || 9092;

//Using Oberoi provided certificate
let options = {
    pfx: fs.readFileSync(path.join(__dirname, 'cticonnector.oberoirealty.com.pfx')),
    passphrase: 'oberoirealty@123'
};

const app = express()
    , server = require('https').createServer(options, app)

app.use(serveStatic(path.join(__dirname, 'dist')));

// function send404(req, res) {
//     // send your 404 here
//     res.render('404')
//   }
server.setTimeout(SERVER_TIMEOUT_MS);

server.listen(PORT, () => {
    console.log(`AGC Softphone served on port ${PORT}`);
});