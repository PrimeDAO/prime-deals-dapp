const path = require('path');
const thisDir = path.resolve(__dirname);

module.exports = {
  extends: ['../.eslintrc.json'],
  parserOptions: {
    project: path.join(thisDir, 'tsconfig.json'),
    tsconfigRootDir: thisDir,
  },
};
