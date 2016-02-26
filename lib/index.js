'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

require('./utils/Array.prototype.deepFilterAdvance.js');
require('./utils/Array.prototype.deepRemove.js');
require('./utils/Array.prototype.getTally.js');
var getRandomInt = require('./utils/getRandomInt.js');

var InstantRunoffVote = function () {
  function InstantRunoffVote(voteList, candidates) {
    _classCallCheck(this, InstantRunoffVote);

    this.votes = voteList;
    this.candidates = candidates;
    this.rounds = [];
    this.winner = null;
  }

  _createClass(InstantRunoffVote, [{
    key: 'hasWinner',
    value: function hasWinner() {
      return !!(this.winner !== null);
    }
  }, {
    key: 'checkForMajority',
    value: function checkForMajority(round) {
      var result = { majorityExists: false, winner: null };

      for (var i = 0; i < round.tally.length; i++) {
        var obj = round.tally[i];
        var percentage = obj.count / round.count;

        if (percentage > 0.5) {
          result = { majorityExists: true, winner: obj.name };
          break;
        }
      }

      return result;
    }

    /**
     * Get the candidates with the lowest counts for a particular round.
     * Filter out candidates that have been losers in previous rounds.
     * @param tally - sorted by the length of count array
     * @returns {*}
     */

  }, {
    key: 'getLoserCandidatesTally',
    value: function getLoserCandidatesTally(tally) {
      var previousLosers = this.rounds.map(function (r) {
        return r.loser;
      });
      var lowestCount = void 0;

      for (var i = 0; i < tally.length; i++) {
        var candidate = tally[i];
        if (!_.includes(previousLosers, candidate.name)) {
          lowestCount = candidate.count;
          break;
        }
      }

      return tally.filter(function (t) {
        return t.count === lowestCount;
      });
    }

    /**
     * If there is more than one loser candidate, check subsequent sets of votes
     */

  }, {
    key: 'findLoser',
    value: function findLoser(tally, votes) {
      // Determine if there is a single loser from current round
      if (tally.length === 1) {
        return tally[0].name;
      }

      var loserCandidates = this.getLoserCandidates(tally);
      /**
       * loser candidates stay the same
       * tally is reconfigured
       * votes are reconfigured
       */
      return this.recursiveTiebreaker(loserCandidates, tally, votes);
    }
  }, {
    key: 'getLoserCandidates',
    value: function getLoserCandidates(tally) {
      return tally.map(function (item) {
        return item.name;
      });
    }
  }, {
    key: 'recursiveTiebreaker',
    value: function recursiveTiebreaker(loserCandidates, tally, votes) {
      // First, check is whether the list has been exhausted, thus an unbroken tie
      if (listHasExhausted(tally)) {
        var random = getRandomInt(0, loserCandidates.length - 1);
        return loserCandidates[random];
      }

      if (tieIsBroken(tally)) {
        // Get loser with lowest count
        return tally[0].name;
      }

      // Tie remains - as a result, look to the next set of votes to break tie filtered by loser candidates
      var updatedVotes = votes.deepFilterAdvance(loserCandidates);

      var updatedTally = updatedVotes.getTally(loserCandidates).filter(function (item) {
        return _.includes(loserCandidates, item.name);
      });

      return this.recursiveTiebreaker(loserCandidates, updatedTally, updatedVotes);

      function listHasExhausted(array) {
        return !!(_.head(array).count === 0 && _.last(array).count === 0);
      }

      function tieIsBroken(sortedArray) {
        return !!(sortedArray[0].count !== sortedArray[1].count);
      }
    }
  }, {
    key: 'getRoundVotes',
    value: function getRoundVotes(votes, candidates) {
      var tally = votes.reduce(function (reduction, currentValue, currentIndex) {
        var match = reduction.find(function (o) {
          return o.name === currentValue[0];
        });
        if (match) {
          match.count.push(currentIndex);
        } else {
          reduction.push({ name: currentValue[0], count: [currentIndex] });
        }
        return reduction;
      }, []);

      if (candidates) {
        candidates.forEach(function (r) {
          var isIncluded = tally.find(function (t) {
            return t.name === r;
          });

          if (!isIncluded) {
            tally.push({ name: r, count: [] });
          }
        });
      }
      return _.sortBy(tally, 'count.length');
    }

    /**
     * Build overall results, which consist of round data
     * @param votes: an array of arrays
     */

  }, {
    key: 'setResults',
    value: function setResults() {
      var votes = arguments.length <= 0 || arguments[0] === undefined ? this.votes : arguments[0];

      var round = {
        tally: [],
        votes: [],
        count: null,
        loserCandidates: [],
        loser: null
      };

      round.tally = votes.getTally(this.candidates);
      round.votes = this.getRoundVotes(votes, this.candidates);
      round.count = round.tally.reduce(function (reduction, currentValue) {
        return reduction + currentValue.count;
      }, 0);

      var majorityCheck = this.checkForMajority(round);
      if (majorityCheck.majorityExists) {
        this.rounds.push(round);
        return this.winner = majorityCheck.winner;
      }

      var loserCandidatesTally = this.getLoserCandidatesTally(round.tally);
      round.loserCandidates = this.getLoserCandidates(loserCandidatesTally);
      // determine ultimate loser from this round. resolve ties by looking at sets of lower ranked votes
      round.loser = this.findLoser(loserCandidatesTally, votes);

      this.rounds.push(round);

      var filteredVotes = votes.deepRemove(round.loser);

      return this.setResults(filteredVotes);
    }
  }, {
    key: 'getResults',
    value: function getResults() {
      return _.pick(this, ['candidates', 'rounds', 'winner']);
    }
  }]);

  return InstantRunoffVote;
}();

module.exports = InstantRunoffVote;