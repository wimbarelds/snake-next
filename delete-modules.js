console.log('-- delete-modules.js');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const fs = require('fs');
  fs.rmdirSync(resolve(__dirname, 'node_modules'));
}
