/* eslint-disable no-console */
'use strict';

const pkg = require('./package.json');

const LATEST_URL =
  'https://api.github.com/repos/mozilla/geckodriver/releases/latest';

function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const diff = (aParts[i] || 0) - (bParts[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function main() {
  const response = await fetch(LATEST_URL, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const tag = data && data.tag_name;
  if (!tag) {
    throw new Error('Could not find tag_name in GitHub release response');
  }
  const latestVersion = tag.replace(/^v/, '');
  const currentVersion = pkg.geckodriver_version;
  if (compareVersions(latestVersion, currentVersion) > 0) {
    console.log(`Upgrade to ${latestVersion}`);
    process.exit(1);
  }
  console.log(`Relax, ${currentVersion} is the latest version`);
}

main().catch(err => {
  console.log(`Failed to parse latest release version: ${err.message}`);
  process.exit(1);
});
