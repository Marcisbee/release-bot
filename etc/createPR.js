// @ts-check
/**
 * @param {import('probot').Context} context
 * @param {import('..').Fields} fields
 */
async function createPR(context, fields) {
  const branch = fields.branch.substr(0, 10);

  // get the reference for the master branch
  const reference = await context.github.gitdata.getRef(context.repo({
    ref: 'heads/master',
  }));

  // create a reference in git for your branch
  await context.github.gitdata.createRef(context.repo({
    ref: `refs/heads/${branch}`,
    sha: reference.data.object.sha,
  }));

  // eslint-disable-next-line no-restricted-syntax
  for (const file of fields.files) {
    const content = Buffer.from(file.content).toString('base64');

    await context.github.repos.createFile(context.repo({
      path: file.path,
      message: `${file.sha ? 'updates' : 'adds'} ${file.path}`,
      content,
      branch,
      sha: file.sha || undefined,
    }));
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const file of fields.deleteFiles) {
    await context.github.repos.deleteFile(context.repo({
      path: file.path,
      message: `deletes ${file.path}`,
      branch,
      sha: file.sha,
    }));
  }

  return context.github.pullRequests.create(context.repo({
    title: fields.pr.title, // the title of the PR
    head: branch,
    base: 'master', // where you want to merge your changes
    body: fields.pr.body, // the body of your PR,
    maintainer_can_modify: true, // allows maintainers to edit your app's PR
  }));
}

module.exports = createPR;
