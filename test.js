import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { binPath } from './index.js';

const require = createRequire(import.meta.url);
const packageVersion = require('./package.json').geckodriver_version;

const expectedVersionPrefix = `geckodriver ${packageVersion}`;

const driverVersion = execFileSync(binPath(), ['--version']).toString();

if (!driverVersion.startsWith(expectedVersionPrefix)) {
  throw new Error(
    `Expected driver version to be ${expectedVersionPrefix} but it was ${driverVersion}`
  );
}
