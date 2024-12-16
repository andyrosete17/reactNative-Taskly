module.exports = {
  extends: [
    'expo',
    'plugin:prettier/recommended' // Integra Prettier con ESLint
  ],
  plugins: ['prettier', 'react-native'],
  rules: {
    'react-native/no-unused-styles': 'error',
    'prettier/prettier': [
      'error',
      {
        bracketSpacing: true,
        trailingComma: 'none',
        singleQuote: true,
        semi: true,
        useTabs: false,
        tabWidth: 2,
        printWidth: 90,
        arrowParens: 'avoid',
        quoteProps: 'as-needed',
        jsxSingleQuote: false
      }
    ]
  }
};
