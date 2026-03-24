module.exports = function (api) {
  // Cache based on NODE_ENV so the test / non-test configs are cached separately.
  // Using api.cache.using() lets us safely read process.env without triggering
  // the "already configured" Babel error.
  api.cache.using(() => process.env.NODE_ENV)

  // When Jest runs it sets NODE_ENV=test.
  // babel-preset-expo auto-includes react-native-reanimated/plugin, which in
  // turn requires react-native-worklets (not installed as a test dep).
  // Passing `reanimated: false` to the preset disables that auto-inclusion.
  const isTest = process.env.NODE_ENV === 'test'

  return {
    presets: [
      [
        'babel-preset-expo',
        // Disable Reanimated plugin during test runs to avoid missing
        // react-native-worklets dependency.
        isTest ? { reanimated: false } : {},
      ],
    ],
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  }
}
