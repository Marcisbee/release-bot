// @ts-check
/**
 * @param {string} version
 * @param {number} type
 * @return {string}
 */
function bumpVersion(version, type) {
  let index = -1;
  return version.replace(/[0-9]+/g, (number) => {
    index += 1;
    if (index < type) return number;
    if (index > type) return '0';
    return String(parseInt(number, 10) + 1);
  });
}

module.exports = bumpVersion;
