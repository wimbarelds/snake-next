const { resolve } = require('path');
const { copySync, readFileSync, writeFileSync, existsSync } = require('fs-extra');
const process = require('process');

console.log('-- Cyclic, pre-deploy script');
if (!process.env.IS_CYCLIC) {
  console.log('process.env.IS_CYCLIC', false, '(Skipping script)');
  process.exit(0);
}

// #region copy
console.log('> Copy files');
const root = resolve(__dirname, '..');
const targetDirectory = 'dist';
const copyMap = {
  '.next/standalone': '',
  '.next/static': '.next/static',
  'public': 'public',
};

const fromRelative = (relative, base = root) =>
  resolve(base, ...relative.split('/').filter(Boolean));
const destBase = fromRelative(targetDirectory);

for (const [from, to] of Object.entries(copyMap)) {
  const source = fromRelative(from);
  const dest = fromRelative(to, destBase);
  const relSource = source.slice(root.length);
  const relTarget = dest.slice(root.length);
  console.log(`> Copy from '${relSource}' to '${relTarget}'`);
  copySync(source, dest);
}
// #endregion copy

// #region update package.json
console.log('> Modifying npm start script');
const packagePath = resolve(destBase, 'package.json');
const packageRaw =
  (existsSync(packagePath) && readFileSync(packagePath, { encoding: 'utf-8' })) || '{}';
const packageJson = JSON.parse(packageRaw);
if (!packageJson.scripts) packageJson.scripts = {};
packageJson.scripts.start = 'node server.js';

writeFileSync(packagePath, JSON.stringify(packageJson, null, '  '));
// #endregion
