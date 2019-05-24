// @ts-check
/**
 * @type {import('..').Config}
 */
// @ts-ignore
const CONFIG = require('../config.json');

/**
 * @param {string} value
 * @return {string}
 */
function capitalise(value) {
  return value[0].toUpperCase().concat(value.substring(1, value.length));
}

/**
 * @param {import('..').Change[]} changes
 * @return {string}
 */
function buildDescription(changes) {
  const changeObject = changes.reduce(
    (acc, change) => {
      const { type, category, description } = change;
      const typeData = acc[type] || {};
      const categoryData = typeData[category] || [];
      return {
        ...acc,
        [type]: {
          ...typeData,
          [category]: categoryData.concat(description),
        },
      };
    },
    {},
  );

  return Object.keys(changeObject)
    .map((type) => {
      const typeName = CONFIG.alias[type];
      const typeList = Object.keys(changeObject[type])
        .map((cagtegory) => {
          const cagtegoryList = changeObject[type][cagtegory]
            .map((desc) => `  - ${desc}`).join('\n');

          return `- ${capitalise(cagtegory)}\n${cagtegoryList}`;
        }).join('\n');

      return `## ${typeName}\n${typeList}\n`;
    }).join('\n');
}

module.exports = buildDescription;
