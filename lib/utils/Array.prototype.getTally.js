'use strict';

var _ = require('lodash');

Array.prototype.getTally = function (required) {
  var tally = this.reduce(function (reduction, currentValue) {
    var match = reduction.find(function (o) {
      return o.name === currentValue[0];
    });
    if (match) {
      match.count++;
    } else {
      reduction.push({ name: currentValue[0], count: 1 });
    }
    return reduction;
  }, []);

  if (required) {
    required.forEach(function (r) {
      var isIncluded = tally.find(function (t) {
        return t.name === r;
      });

      if (!isIncluded) {
        tally.push({ name: r, count: 0 });
      }
    });
  }
  return _.sortBy(tally, 'count');
};