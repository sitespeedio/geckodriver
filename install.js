'use strict';

const StreamZip = require('node-stream-zip');
const os = require('os');
const fs = require('fs');
const path = require('path');
const pkg = require('./package');
const { DownloaderHelper } = require('node-downloader-helper');
const { promisify } = require('util');
const tar = require('tar');
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const chmod = promisify(fs.chmod);

// The version of the driver that will be installed
const GECKODRIVER_VERSION = process.env.GECKODRIVER_VERSION
  ? `v${process.env.GECKODRIVER_VERSION}`
  : `v${pkg.geckodriver_version}`;

const isWindows = os.platform() === 'win32';

function byteHelper(value) {
  // https://gist.github.com/thomseddon/3511330
  const units = ['b', 'kB', 'MB', 'GB', 'TB'],
    number = Math.floor(Math.log(value) / Math.log(1024));
  return (
    (value / Math.pow(1024, Math.floor(number))).toFixed(1) +
    ' ' +
    units[number]
  );
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
    case 'darwin':
      return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-macos.tar.gz`;
    case 'linux': {
      if (os.arch() === 'arm') {
        // Don't want to spend hours to build a new one, so for now serve 0.29.0
        // or unreleased 0.30.0
        return `${urlBase}geckodriver-0.30.0-linux-arm.tar.gz`;
      } else {
        const arch = os.arch() === 'x64' ? '64' : '32';
        return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-linux${arch}.tar.gz`;
      }
    }
    case 'win32': {
      const arch = os.arch() === 'x64' ? 'win64' : 'win32';
      return `${urlBase}geckodriver-${GECKODRIVER_VERSION}-${arch}.zip`;
    }
    default:
      return undefined;
  }
}

async function download() {
  if (
    process.env.npm_config_geckodriver_skip_download ||
    process.env.GECKODRIVER_SKIP_DOWNLOAD
  ) {
    console.log('Skip downloading Geckodriver');
  } else {
    const downloadUrl = getDriverUrl();
    if (downloadUrl) {
      try {
        await mkdir('vendor');
      } catch (e) {
        try {
          await unlink('vendor/geckodriver');
        } catch (e) {
          // nothing to do here
        }
      }
      const dl = new DownloaderHelper(downloadUrl, 'vendor', {
        fileName: 'geckodriver' + (isWindows ? '.zip' : '.tar.gz')
      });

      dl.on('error', err =>
        console.error('Could not download Geckodriver: ' + downloadUrl, err)
      )
        .on('progress', stats => {
          const progress = stats.progress.toFixed(1);
          const speed = byteHelper(stats.speed);
          const downloaded = byteHelper(stats.downloaded);
          const total = byteHelper(stats.total);
          console.log(`${speed}/s - ${progress}% [${downloaded}/${total}]`);
        })
        .on('end', () => {
          if (isWindows) {
            const zip = new StreamZip({
              file: 'vendor/geckodriver.zip',
              storeEntries: true
            });
            zip.on('ready', () => {
              zip.extract(null, './vendor', async err => {
                console.log(
                  err
                    ? 'Could not extract and install Geckodriver'
                    : `Geckodriver ${GECKODRIVER_VERSION} installed in ${path.join(
                        __dirname,
                        'vendor'
                      )}`
                );
                zip.close();
                await unlink('vendor/geckodriver.zip');
                await chmod('vendor/geckodriver.exe', '755');
              });
            });
          } else {
            tar
              .x({
                file: 'vendor/geckodriver.tar.gz',
                cwd: 'vendor'
              })
              .then(async () => {
                await unlink('vendor/geckodriver.tar.gz');
                await chmod('vendor/geckodriver', '755');
                console.log(
                  `Geckodriver ${GECKODRIVER_VERSION} installed in ${path.join(
                    __dirname,
                    'vendor'
                  )}`
                );
              });
          }
        });

      dl.start();
    } else {
      console.log(
        'Skipping installing Geckodriver on ' +
          os.platform() +
          ' for ' +
          os.arch() +
          " since there's no official build"
      );
    }
  }
}
download();
