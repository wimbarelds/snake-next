/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  settings: {
    'react': { version: 'detect' },
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: ['.ts', '.mts', '.cts', '.tsx', '.d.ts'],
    },
    'import/resolver': {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true,
      },
    },
  },
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    babelOptions: {
      presets: ['next/babel'],
      caller: {
        // Eslint supports top level await when a parser for it is included.
        // Next enables the parser by default for Babel.
        supportsTopLevelAwait: true,
      },
    },
    project: ['./tsconfig.json'],
  },
  reportUnusedDisableDirectives: true,
  plugins: ['react', 'simple-import-sort', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
    'prettier',
    'plugin:@next/next/recommended',
  ],
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'import/prefer-default-export': 'off',
    'react/function-component-definition': [
      'error',
      { namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
    ],
    'import/extensions': [
      'error',
      'always',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'react/require-default-props': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'no-useless-return': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/no-danger': 'error',
    'func-names': ['error', 'always'],
    'no-param-reassign': 'error',
    'react/destructuring-assignment': 'off',
    'dot-notation': 'error',
    'react/jsx-props-no-spreading': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-console': 'error',
    'react/no-unused-prop-types': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // https://github.com/typescript-eslint/typescript-eslint/issues/6934
        // TODO - Revert to `true` with next version of @typescript-eslint/eslint-plugin
        warnOnUnsupportedTypeScriptVersion: false,
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'separate-type-imports' },
        ],
        '@typescript-eslint/dot-notation': 'error',
        'no-use-before-define': 'off',
        'dot-notation': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
