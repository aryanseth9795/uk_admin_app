// // babel.config.cjs
// module.exports = function (api) {
//   api.cache(true);

//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           root: ['./src'],
//           alias: {
//             '@': './src',
//           },
//         },
//       ],
//       // ❌ DO NOT add:
//       // 'react-native-reanimated/plugin'
//       // 'react-native-worklets/plugin'
//       // or any transform-react-jsx-* plugins
//     ],
//   };
// };
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       'react-native-reanimated/plugin',
//       [
//         'module-resolver',
//         {
//           root: ['./src'],
//           alias: {
//             '@': './src',
//             // '@nav': './src/navigation',
//             // '@screens': './src/screens',
//             // '@components': './src/components',
//             // '@store': './src/store',
//             // '@utils': './src/utils',
//             // '@theme': './src/theme',
//           },
//         },
//       ],
//     ],
//   };
// };


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
