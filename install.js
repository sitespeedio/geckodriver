import os from 'node:os';
import path from 'node:path';
import { mkdir, unlink, chmod } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { x as extractTar } from 'tar';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The version of the driver that will be installed
const GECKODRIVER_VERSION = process.env.GECKODRIVER_VERSION
  ? `v${process.env.GECKODRIVER_VERSION}`
  : `v${pkg.geckodriver_version}`;

const isWindows = os.platform() === 'win32';

function byteHelper(value) {
  // https://gist.github.com/thomseddon/3511330
  if (!value) return '?';
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(value) / Math.log(1024));
  return `${(value / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getDriverUrl() {
  let urlBase;
  if (process.env.GECKODRIVER_BASE_URL) {
    urlBase = process.env.GECKODRIVER_BASE_URL;
  } else if (os.platform() === 'linux' && os.arch() === 'arm') {
    urlBase = `https://github.com/sitespeedio/geckodriver/releases/download/v0.29.0/`;
  } else {
    urlBase = `https://github.com/mozilla/geckodriver/releases/download/${GECKODRIVER_VERSION}/`;
  }

  switch (os.platform()) {
    case 'darwin': {
      // Starting from Geckodriver v0.29.1, there is a separate build for arm64
      // architecture. Let's install it if we are on arm64 as well.
      const arch = os.arch() === 'arm64' ? '-aarch64' : '';
      return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-macos${arch}.tar.gz`;
    }
    case 'linux': {
      if (os.arch() === 'arm') {
        // Don't want to spend hours to build a new one, so for now serve 0.29.0
        // or unreleased 0.30.0
        return `${urlBase}geckodriver-0.30.0-linux-arm.tar.gz`;
      }
      if (os.arch() === 'arm64') {
        return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-linux-aarch64.tar.gz`;
      }
      const arch = os.arch() === 'x64' ? '64' : '32';
      return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-linux${arch}.tar.gz`;
    }
    case 'win32': {
      const arch = os.arch() === 'x64' ? 'win64' : 'win32';
      return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-${arch}.zip`;
    }
    default: {
      return;
    }
  }
}

async function downloadFile(url, destination) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText} for ${url}`
    );
  }
  const total = Number(response.headers.get('content-length')) || 0;
  let downloaded = 0;
  let lastLog = 0;
  const body = Readable.fromWeb(response.body);
  body.on('data', chunk => {
    downloaded += chunk.length;
    const now = Date.now();
    if (now - lastLog >= 250) {
      const pct = total ? ((downloaded / total) * 100).toFixed(1) : '?';
      console.log(`${pct}% [${byteHelper(downloaded)}/${byteHelper(total)}]`);
      lastLog = now;
    }
  });
  await pipeline(body, createWriteStream(destination));
}

// Windows 10 build 17063+ (April 2018) ships bsdtar as tar.exe and can extract
// a .zip in place. We use that instead of pulling in a JS zip dependency.
async function extractZipWindows(zipPath, destDir) {
  await execFileAsync('tar', ['-xf', zipPath, '-C', destDir]);
}

async function tryUnlink(p) {
  try {
    await unlink(p);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function install() {
  if (
    process.env.npm_config_geckodriver_skip_download ||
    process.env.GECKODRIVER_SKIP_DOWNLOAD
  ) {
    console.log('Skip downloading Geckodriver');
    return;
  }

  const url = getDriverUrl();
  if (!url) {
    console.log(
      `Skipping installing Geckodriver on ${os.platform()} for ${os.arch()} since there's no official build`
    );
    return;
  }

  const vendorDir = path.resolve(__dirname, 'vendor');
  await mkdir(vendorDir, { recursive: true });

  const ext = isWindows ? '.exe' : '';
  const binPath = path.join(vendorDir, `geckodriver${ext}`);
  await tryUnlink(binPath);

  const archivePath = path.join(
    vendorDir,
    isWindows ? 'geckodriver.zip' : 'geckodriver.tar.gz'
  );

  console.log(`Downloading Geckodriver ${GECKODRIVER_VERSION} from ${url}`);
  await downloadFile(url, archivePath);

  await (isWindows
    ? extractZipWindows(archivePath, vendorDir)
    : extractTar({ file: archivePath, cwd: vendorDir }));

  await unlink(archivePath);
  await chmod(binPath, 0o755);
  console.log(`Geckodriver ${GECKODRIVER_VERSION} installed in ${vendorDir}`);
}

try {
  await install();
} catch (error) {
  console.error(
    `Geckodriver ${GECKODRIVER_VERSION} could not be installed: ${error.message}`
  );
  process.exitCode = 1;
}
