module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    testPathIgnorePatterns: ["/node_modules/"],
    verbose: true,
    moduleFileExtensions: [
      'js',
      'jsx',
      'ts',
      'tsx',
      'json',
      'node'
    ],
    testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ]
};