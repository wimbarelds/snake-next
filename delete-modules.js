console.log('-- delete-modules.js');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const path = require('path');
  const { rimrafSync } = require('rimraf');
  const target = path.resolve(__dirname, 'node_modules');
  console.log('Deleting', target);
  rimrafSync(path.resolve(__dirname, 'node_modules'), { preserveRoot: true });
  console.log('Delete finished');
}
