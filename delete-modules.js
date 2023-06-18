console.log('-- delete-modules.js');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const path = require('path');
  const { sync } = require('rimraf');
  sync(path.resolve(__dirname, 'node_modules'));
  console.log('Delete finished');
}
