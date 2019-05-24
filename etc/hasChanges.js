/**
 * @param {import('probot').Context} context
 * @returns {boolean}
 */
module.exports = (context) => {
  return context.payload.head_commit.added
    .concat(context.payload.head_commit.modified)
    .filter((file) => (
      /^\.changes\/(?!template\.json)/.test(file)
    )).length > 0
}
