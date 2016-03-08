var rcv = require('./index.js');

var candidates = [
  "C3PO",
  "Yoda"
];

var votes = [
  ['Yoda'],
  ['C3PO']
];

var election = new rcv(candidates, votes);
var results = election.getResults();