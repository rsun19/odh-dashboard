module.exports = require('@odh-dashboard/eslint-config')
  .extend({
    ignorePatterns: ['src', '@mf-types', 'docs'],
  })
  .recommendedTypescript(__dirname);
