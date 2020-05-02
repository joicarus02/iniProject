const Obserser = require('./observer');
const HLSServer = require('hls-server')
const http = require('http')

var obserser = new Obserser();
const server = http.createServer()
const folder = './source';

const express = require('express');

const app = express();

obserser.watchFolder(folder);


///////////////////////////

const hls = new HLSServer(server, {
  path: '/streams',     // Base URI to output HLS streams
  dir: 'source-m3u8'  // Directory that input files are stored
})

server.listen(8000)


app.listen(8080,function() {
     console.log(`App running successfully on port number 8080...`);
});