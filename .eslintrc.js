// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolve } = require('path');

module.exports = {
//   extends: ['@tencent/eslint-config-tencent', '@tencent/eslint-config-tencent/ts'],
  root: true,
  parserOptions: {
    project: resolve(__dirname, './tsconfig.json'),
    createDefaultProgram: true,
  },
  "ignorePatterns": ["/src/lib/*"],
  env: {
    browser: true,
  },
  // 允许的全局变量
  globals: {
  },
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'function-paren-newline': 'off',
    'arrow-body-style': 'off',
    eqeqeq: [2, 'allow-null'],
  },
};