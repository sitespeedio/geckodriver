'use strict';

const os = require('os');
const path = require('path');
const pkg = require('./package');
const { execSync } = require('child_process');

module.exports = {
  version: pkg.geckodriver_version,
  binPath: function() {
    let driverPath = path.resolve(__dirname, 'vendor', 'geckodriver');
    if (os.platform() === 'win32') {
      return driverPath + '.exe';
    } else if (
      (os.platform() === 'linux' && os.arch() === 'arm') ||
      (os.platform() === 'linux' && os.arch() === 'arm64')
    ) {
      // Special handling for making it easy on Raspberry Pis
      const potentialGeckodriverPath = execSync('which geckodriver');
      if (potentialGeckodriverPath !== undefined) {
        return potentialGeckodriverPath.toString().trim();
      }
    } else {
      return driverPath;
    }
  }
};
