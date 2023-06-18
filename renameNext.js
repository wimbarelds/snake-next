console.log('-- renameNext');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const path = require('path');
  const fs = require('fs');
  fs.renameSync(path.resolve(__dirname, '.next'), path.resolve(__dirname, '_next'));
  console.log('Renamed finished');
  fs.writeFileSync(
    path.resolve(__dirname, '_next', 'package.json'),
    JSON.stringify({ type: 'commonjs', scripts: { start: 'node standalone/server.js' } }),
  );
  console.log('Created package json');
}
