/* eslint-disable no-console */
'use strict';

const download = require('download');
const os = require('os');
const pkg = require('./package');

function getGeckodriverUrl() {
  const version = `v${pkg.geckodriver_version}`;

  let urlBase;
  if (process.env.GECKODRIVER_BASE_URL) {
    urlBase = process.env.GECKODRIVER_BASE_URL;
  } else {
    urlBase = `https://github.com/mozilla/geckodriver/releases/download/${version}/`;
  }

  switch (os.platform()) {
    case 'darwin':
      return `${urlBase}geckodriver-${version}-macos.tar.gz`;
    case 'linux': {
      const arch = os.arch() === 'x64' ? '64' : '32';
      return `${urlBase}geckodriver-${version}-linux${arch}.tar.gz`;
    }
    case 'win32': {
      const arch = os.arch() === 'x64' ? 'win64' : 'win32';
      return `${urlBase}geckodriver-${version}-${arch}.zip`;
    }
    default:
      throw new Error('Unsupported platform: ' + os.platform());
  }
}

console.log(`Downloading from ${getGeckodriverUrl()}`);
download(getGeckodriverUrl(), 'vendor', {
  mode: '755',
  extract: true
}).catch(e => {
  console.error('Failed to download: ', e);
  process.exitCode = 1;
});
