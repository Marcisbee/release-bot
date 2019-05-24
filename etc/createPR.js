/**
 * @param {import('probot').Context} context
 * @param {{files: {path: string, content: string}[], pr: {body: string, title: string}}} fields
 */
module.exports = async (context, fields) => {
  const branch = fields.branch.substr(0, 10) // your branch's name

  // get the reference for the master branch
  const reference = await context.github.gitdata.getRef(context.repo({
    ref: 'heads/master'
  }))

  await context.github.gitdata.createRef(context.repo({
    ref: `refs/heads/${branch}`,
    sha: reference.data.object.sha
  })) // create a reference in git for your branch

  for (const file of fields.files) {
    const content = Buffer.from(file.content).toString('base64') // content for your configuration file

    await context.github.repos.createFile(context.repo({
      path: file.path, // the path to your config file
      message: `${file.sha ? 'updates' : 'adds'} ${file.path}`, // a commit message
      content,
      branch,
      sha: file.sha || undefined
    })) // create your config file
  }

  for (const file of fields.deleteFiles) {
    await context.github.repos.deleteFile(context.repo({
      path: file.path, // the path to your config file
      message: `deletes ${file.path}`, // a commit message
      branch,
      sha: file.sha
    })) // create your config file
  }

  return context.github.pullRequests.create(context.repo({
    title: fields.pr.title, // the title of the PR
    head: branch,
    base: 'master', // where you want to merge your changes
    body: fields.pr.body, // the body of your PR,
    maintainer_can_modify: true // allows maintainers to edit your app's PR
  }))
}
