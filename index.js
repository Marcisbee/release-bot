// @ts-check
const createPR = require('./etc/createPR');
const getPaths = require('./etc/getPaths');
const hasChanges = require('./etc/hasChanges');
const mergeChangelog = require('./etc/mergeChangelog');

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = (app) => {
  // Your code here
  app.log('Yay, the app was loaded!');

  app.on('push', async (context) => {
    // We only care about master branch
    if (context.payload.ref !== 'refs/heads/master') return;

    // Continue only when we have changes in `.changes` folder
    if (!hasChanges(context)) return;

    const repoName = context.payload.repository.full_name;
    const { changes, files } = await getPaths(context, '.changes/');
    const lastCommitId = context.payload.head_commit.id;

    /**
     * @type {string}
     */
    let changelogContents = null;
    let changelogBlob;
    try {
      changelogBlob = await context.github.repos.getContents(context.repo({
        ref: 'heads/master',
        path: 'CHANGELOG.md',
      }));

      changelogContents = Buffer.from(changelogBlob.data.content, 'base64').toString('utf-8');
    } catch (e) {
      console.warn(e);
    }

    /**
     * @type {{version: string}}
     */
    let packageJsonContents;
    let packageBlob;
    try {
      packageBlob = await context.github.repos.getContents(context.repo({
        ref: 'heads/master',
        path: 'package.json',
      }));

      packageJsonContents = JSON.parse(
        Buffer.from(packageBlob.data.content, 'base64').toString('utf-8'),
      );
    } catch (e) {
      console.warn(e);
    }

    const {
      changelog,
      fromVersion,
      version,
    } = mergeChangelog(
      changes,
      repoName,
      changelogContents,
      packageJsonContents && packageJsonContents.version,
    );

    // Let's do this insead of using ...spread, so that version stays in same place
    if (packageJsonContents) {
      packageJsonContents.version = version;
    }

    // Also need to account for json file formatting
    const packageJson = `${JSON.stringify(packageJsonContents, null, '  ')}\n`;

    const output = {
      files: [
        packageJson && {
          path: 'package.json',
          content: packageJson,
          sha: (packageBlob || { data: {} }).data.sha,
        },
        {
          path: 'CHANGELOG.md',
          content: changelog,
          sha: (changelogBlob || { data: {} }).data.sha,
        },
      ].filter((file) => !!file),
      deleteFiles: files,
      pr: {
        title: `[Release] ${fromVersion && `v${fromVersion} - `}v${version}`,
        body: `# Ready for release\nChanges made from last release: [v${fromVersion}...v${version}](https://github.com/${repoName}/compare/v${fromVersion}...${lastCommitId})\n\n**NOTE**: Don't forget to create a release after merging this PR!`,
      },
      branch: lastCommitId,
    };

    await createPR(context, output);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

/**
 * @typedef {Object<string, any>} Config
 * @property {{[key: string]: number}} types
 * @property {{[key: string]: string}} alias
 */

/**
 * @typedef {Object<string, any>} Change
 * @property {string} type
 * @property {string} category
 * @property {string} description
 */

/**
 * @typedef {Object<string, any>} DeleteFile
 * @property {string} path
 * @property {string} sha
 */

/**
 * @typedef {Object<string, any>} PullRequest
 * @property {string} body
 * @property {string} title
 */

/**
 * @typedef {Object<string, any>} File
 * @property {string} path
 * @property {string} content
 * @property {string} [sha]
 */

/**
 * @typedef {Object<string, any>} Fields
 * @property {File[]} files
 * @property {DeleteFile[]} deleteFiles
 * @property {PullRequest} pr
 * @property {string} branch
 */
