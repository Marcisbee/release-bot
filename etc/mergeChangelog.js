const buildDescription = require('./buildDescription');
const bumpVersion = require('./bumpVersion');
const getHighestType = require('./getHighestType');

const LAST_VERSION_LINE = /^## \[([v0-9.]+).*[\n\r]/mi;

/**
 * @param {Change[]} changes
 * @param {string} repo
 * @param {string} log
 * @param {string} defaultVersion
 * @return {{changelog: string, fromVersion: string, version: string}}
 */
function mergeChangelog(changes, repo, log, defaultVersion) {
  const currentDate = new Date().toJSON().replace(/T.*/, '');
  const changesText = buildDescription(changes);
  const type = getHighestType(changes);

  // Changelog doesn't exist, create new one
  if (!log) {
    const newVersion = bumpVersion(defaultVersion || '0.0.0', type);
    const url = `https://github.com/${repo}/compare/master@{1day}...v${newVersion}`;

    return {
      changelog: `# Changelog

## [v${newVersion}](${url}) (${currentDate})
${changesText}`,
      fromVersion: defaultVersion,
      version: newVersion,
    };
  }

  const [
    versionLine = undefined,
    versionFromChangelog = undefined,
  ] = log.match(LAST_VERSION_LINE) || [];
  const fullVersion = defaultVersion || versionFromChangelog;
  const version = fullVersion.replace(/^v/, '');
  const newVersion = bumpVersion(version, type);
  const url = `https://github.com/${repo}/compare/v${version}...v${newVersion}`;

  const newLog = log.replace(versionLine, (match) => (
    `## [v${newVersion}](${url}) (${currentDate})
${changesText}
${match}`
  ));

  return {
    changelog: newLog,
    fromVersion: version,
    version: newVersion,
  };
}

module.exports = mergeChangelog;
