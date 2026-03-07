module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.node'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@navigation': './src/navigation',
          '@context': './src/context',
          '@types-app': './src/types',
        },
      },
    ],
    'react-native-config/babel',
  ],
};
