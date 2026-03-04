// eslint-disable-next-line no-undef
module.exports = {
  'roots': [
    '<rootDir>',
  ],
  'testMatch': [
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  'transform': {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
}
