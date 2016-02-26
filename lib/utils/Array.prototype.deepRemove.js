"use strict";

Array.prototype.deepRemove = function (value) {
  return this.map(function (childArray) {
    return childArray.filter(function (item) {
      return item !== value;
    });
  });
};