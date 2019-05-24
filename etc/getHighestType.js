// @ts-check
/**
 * @type {import('..').Config}
 */
// @ts-ignore
const CONFIG = require('../config.json');

/**
 * @param {import('..').Change[]} changes
 * @return {number}
 */
function getHighestType(changes) {
  return changes.reduce((acc, { type }) => {
    /**
     * Always expect the lowest possible change `2 = bugfix`
     */
    const number = CONFIG.types[type] === undefined
      ? 2
      : CONFIG.types[type];
    return acc > number ? number : acc;
  }, 2);
}

module.exports = getHighestType;
