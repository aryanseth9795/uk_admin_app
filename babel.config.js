

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: { '@': './src' },
        },
      ],
      // ⚠️ DO NOT add:
      // 'react-native-reanimated/plugin'
      // 'react-native-worklets/plugin'
      // '@babel/plugin-transform-react-jsx-self'
      // '@babel/plugin-transform-react-jsx-source'
    ],
  };
};
