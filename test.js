const cp = require('child_process');
const geckodriver = require('./');
const packageVersion = require('./package.json').geckodriver_version;

const expectedVersionPrefix = `geckodriver ${packageVersion}`;

const driverVersion = cp
  .execFileSync(geckodriver.binPath(), ['--version'])
  .toString();

if (driverVersion.indexOf(expectedVersionPrefix) !== 0) {
  throw new Error(
    'Expected driver version to be ' +
      expectedVersionPrefix +
      ' but it was ' +
      driverVersion
  );
}
