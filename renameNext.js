console.log('-- renameNext');
const process = require('process');
console.log('IS_CYCLIC', process.env.IS_CYCLIC ? 'true' : 'false');
if (process.env.IS_CYCLIC) {
  const path = require('path');
  const fs = require('fs');

  fs.renameSync(path.resolve(__dirname, '.next', 'standalone'), path.resolve(__dirname, 'dist'));

  fs.renameSync(
    path.resolve(__dirname, '.next', 'static'),
    path.resolve(__dirname, 'dist', '.next', 'static'),
  );
  fs.renameSync(path.resolve(__dirname, 'public'), path.resolve(__dirname, 'dist', 'public'));
  console.log('Move finished');

  const packagePath = path.resolve(__dirname, 'dist', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf-8' }) || '{}');
  if (!packageJson.scripts) packageJson.scripts = {};
  packageJson.scripts.start = 'node server.js';

  fs.writeFileSync(packagePath, JSON.stringify(packageJson));
  console.log('Created package json');
}
