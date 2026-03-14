module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.node'],
        alias: {
          '@store': './src/store',
          '@screens': './src/screens',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@navigation': './src/navigation',
          '@context': './src/context',
          '@types-app': './src/types',
          '@game': './src/types',
          '@theme': './src/theme',
          '@data': './src/data',
        },
      },
    ],
    'react-native-reanimated/plugin', // ⚠️ must be last
  ],
};
