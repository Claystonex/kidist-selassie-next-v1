/** @type {import("@typescript-eslint/utils/ts-eslint").ClassicConfig.Config} */
module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    'plugin:@next/next/recommended'
  ]
};