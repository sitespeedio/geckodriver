/* eslint-disable no-console */
'use strict';

const request = require('request');
const toml = require('toml');
const semver = require('semver');
const currentVersion = require('./package.json').geckodriver_version;

request(
  'https://hg.mozilla.org/mozilla-central/raw-file/tip/testing/geckodriver/Cargo.toml',
  (error, response, body) => {
    if (error) {
      console.log(`Failed to parse latest release version: ${error.message}`);
      return process.exit(1);
    }

    const latestVersion = toml.parse(body).package.version;
    if (semver.gt(latestVersion, currentVersion)) {
      console.log(`Upgrade to ${latestVersion}`);
      process.exit(1);
    }
    console.log(`Relax, ${currentVersion} is the latest version`);
  }
);
