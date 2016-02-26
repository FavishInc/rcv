'use strict';

var _ = require('lodash');

Array.prototype.deepFilterAdvance = function (filterVals) {
  return this.filter(function (childArray) {
    return _.includes(filterVals, childArray[0]);
  }).map(function (childArray) {
    return childArray.slice(1);
  }).filter(function (childArray) {
    return childArray.length;
  });
};