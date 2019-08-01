module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  },
  "coveragePathIgnorePatterns": [
    "tests/stubs.ts"
  ],
}
