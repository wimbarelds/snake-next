console.log('-- delete-modules.js');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const fs = require('fs');
  const path = require('path');
  fs.rmSync(path.resolve(__dirname, 'node_modules'), { recursive: true, force: true });
}
