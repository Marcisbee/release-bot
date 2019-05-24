/**
 * @param {import('probot').Context} context
 * @returns {boolean}
 */
function hasChanges(context) {
  return context.payload.head_commit.added
    .concat(context.payload.head_commit.modified)
    .filter(
      /**
       * @param {string} file
       */
      (file) => (
        /^\.changes\/(?!template\.json)/.test(file)
      ),
    ).length > 0;
}

module.exports = hasChanges;
