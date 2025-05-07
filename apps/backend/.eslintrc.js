module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-debugger': 'warn',
    // Enforce consistent brace style for all control statements
    curly: 'all',
    // Disallow the use of variables outside their binding context
    'block-scoped-var': 'warn',
    // Enforce a maximum line length
    'max-len': ['warn', { code: 120 }],
    // Enforce a maximum depth that blocks can be nested
    'max-depth': ['warn', 4],
    // Disallow magic numbers
    'no-magic-numbers': ['warn', { ignore: [-1, 0, 1] }],
    // Enforce using named capture group in regular expression
    'prefer-named-capture-group': 'warn',
    // Enforce using of const over let or var if the variable is never reassigned
    'prefer-const': 'warn',
    // Disallow the use of alert, confirm, and prompt
    'no-alert': 'warn',
    // Enforce dot notation whenever possible
    'dot-notation': 'warn',
    // Disallow empty functions
    'no-empty-function': 'warn',
  },
};
