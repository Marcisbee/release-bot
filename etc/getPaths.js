// @ts-check
/**
 * @typedef {Object<string, any>} Paths
 * @property {import('..').DeleteFile[]} files
 * @property {import('..').Change[]} changes
 */

/**
 * @param {import('probot').Context} context
 * @param {string} pathname
 * @returns {Promise<Paths>}
 */
async function getPaths(context, pathname) {
  const changesFileList = await context.github.repos.getContents(context.repo({
    ref: 'heads/master',
    path: pathname,
  }));

  /**
   * @type {import('..').DeleteFile[]}
   */
  const files = changesFileList.data
    .filter(({ path }) => !/\/template.json$/.test(path));

  /**
   * @type {import('..').Change[]}
   */
  let changes = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const { path } of files) {
    const change = await context.github.repos.getContents(context.repo({
      ref: 'heads/master',
      path,
    }));

    try {
      changes = changes.concat(
        JSON.parse(
          Buffer.from(change.data.content, 'base64').toString('utf-8'),
        ),
      );
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    files,
    changes,
  };
}

module.exports = getPaths;
