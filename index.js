'use strict';

const os = require('os');
const path = require('path');
const pkg = require('./package');

module.exports = {
  version: pkg.geckodriver_version,
  binPath: function() {
    let driverPath = path.resolve(__dirname, 'vendor', 'geckodriver');
    if (os.platform() === 'win32') {
      driverPath = driverPath + '.exe';
    }
    return driverPath;
  }
};
