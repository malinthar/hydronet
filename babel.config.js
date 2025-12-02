module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }]
    ],
    plugins: [
      // Required for Expo Router
      require.resolve('expo-router/babel'),
      // Handle Flow syntax
      ['@babel/plugin-transform-flow-strip-types', { loose: true }]
    ],
  };
};