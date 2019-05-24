const LAST_VERSION_LINE = /^## \[([v0-9.]+).*[\n\r]/mi

const TYPES = {
  breaking: 0,
  feature: 1,
  bugfix: 2
}

const TYPE_NAMES = {
  breaking: 'Breaking Change',
  feature: 'Feature',
  bugfix: 'Bugfix'
}

function capitalise (value) {
  return value[0].toUpperCase().concat(value.substring(1, value.length))
}

function getNumberOfType (type) {
  return TYPES[type] === undefined
    ? 2
    : TYPES[type]
}

function getHighestType (changes) {
  return changes.reduce((acc, { type }) => {
    const number = getNumberOfType(type)
    return acc > number ? number : acc
  }, 2)
}

function bumpVersion (version, type) {
  let index = -1
  return version.replace(/[0-9]+/g, (number) => {
    index += 1
    if (index < type) return number
    if (index > type) return 0
    return parseInt(number, 10) + 1
  })
}

function buildDescription (changes) {
  const changeObject = changes.reduce(
    (acc, change) => {
      const { type, category, description } = change
      const typeData = acc[type] || {}
      const categoryData = typeData[category] || []
      return {
        ...acc,
        [type]: {
          ...typeData,
          [category]: categoryData.concat(description)
        }
      }
    },
    {}
  )

  return Object.keys(changeObject)
    .map((type) => {
      const typeName = TYPE_NAMES[type]
      const typeList = Object.keys(changeObject[type])
        .map((cagtegory) => {
          const cagtegoryList = changeObject[type][cagtegory]
            .map((desc) => `  - ${desc}`).join('\n')

          return `- ${capitalise(cagtegory)}\n${cagtegoryList}`
        }).join('\n')

      return `## ${typeName}\n${typeList}\n`
    }).join('\n')
}

function mergeChangelog (changes, repo, log, defaultVersion) {
  const currentDate = new Date().toJSON().replace(/T.*/, '')
  const changesText = buildDescription(changes)
  const type = getHighestType(changes)

  // Changelog doesn't exist, create new one
  if (!log) {
    const newVersion = bumpVersion(defaultVersion || '0.0.0', type)
    const url = `https://github.com/${repo}/compare/master@{1day}...v${newVersion}`

    return {
      changelog: `# Changelog

## [v${newVersion}](${url}) (${currentDate})
${changesText}`,
      fromVersion: defaultVersion,
      version: newVersion
    }
  }

  const [versionLine, versionFromChangelog] = log.match(LAST_VERSION_LINE) || []
  const fullVersion = defaultVersion || versionFromChangelog
  const version = fullVersion.replace(/^v/, '')
  const newVersion = bumpVersion(version, type)
  const url = `https://github.com/${repo}/compare/v${version}...v${newVersion}`

  const newLog = log.replace(versionLine, (match) => (
    `## [v${newVersion}](${url}) (${currentDate})
${changesText}
${match}`
  ))

  return {
    changelog: newLog,
    fromVersion: version,
    version: newVersion
  }
}

module.exports = mergeChangelog
