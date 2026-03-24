/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // Allow Jest to transform packages that ship un-compiled ESM from node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

  // Extend Jest matchers with @testing-library/jest-native (toBeVisible, toHaveText, etc.)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}
