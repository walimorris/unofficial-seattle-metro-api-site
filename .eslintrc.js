// ESLint will only use one config file in this project .eslintrc.js has priority
// See ESLint rules documentation: https://eslint.org/docs/latest/user-guide/configuring/rules#configuring-rules
// How to reference ESLint rules in this project: run command - 'eslint --print-config file.js > eslintconfig.txt'
// This will output all eslint properties/rules to a file named eslintconfig.txt

module.exports = {
  root: true,
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
  ],
  parserOptions:  {
    "parser": "babel-eslint"
  },
  rules: {
    'no-console': "off",
    'max-len': "off",
    'no-trailing-spaces': "off",
    'no-debugger': 'off',
    'no-unused-vars': "warn",
  }
}
