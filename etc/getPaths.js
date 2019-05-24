/**
 * @param {import('probot').Context} context
 * @param {string} pathname
 * @returns {string[]}
 */
const getPaths = async (context, pathname) => {
  const changesFileList = await context.github.repos.getContents(context.repo({
    ref: 'heads/master',
    path: pathname
  }))

  const files = changesFileList.data
    .filter(({ path }) => !/\/template.json$/.test(path))
  let changes = []

  for (const { path } of files) {
    const change = await context.github.repos.getContents(context.repo({
      ref: 'heads/master',
      path
    }))

    try {
      changes = changes.concat(
        JSON.parse(
          Buffer.from(change.data.content, 'base64').toString('utf-8')
        )
      )
    } catch (_) {}
  }

  return {
    files,
    changes
  }
}

module.exports = getPaths
