Example:

// include module
var rcv = require('./lib');

var candidates = [1,2,3];
var votes = [
  [1,2,3],
  [2,3,1],
  [2,1,3],
  [3,1,2],
  [3,2,1],
  [1,3,2]
];

// pass in candidates (array of strings) and votes (array of arrays)
var election = new rcv(candidates, votes);
var results = election.getResults();