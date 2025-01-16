export default [
  {
    ignores: ['node_modules/', 'build/', 'dist/'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|val' }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
