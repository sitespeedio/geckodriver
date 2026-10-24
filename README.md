# Geckodriver

This is a simple package that downloads [Geckodriver](https://github.com/mozilla/geckodriver) and 
provides a node api for accessing the path to the binary. With this package we try to minimize dependencies.


How to use?
```node
import driver from '@sitespeed.io/geckodriver';

// Downloads Geckodriver the first time, then returns the path to the binary
const binPath = await driver.ensureBinPath();
// launch geckodriver from binPath
```

The package has no install script, so `npm install` does not download Geckodriver. If you need the driver before the first run, for example when you build a Docker image or on a machine without internet access during tests, download it with:

```
node node_modules/@sitespeed.io/geckodriver/install.js
```

`binPath()` returns the path without a download.

You can override where you download the Geckodriver by setting *process.env.GECKODRIVER_BASE_URL*. You can skip donwloading Geckodriver by setting *process.env.GECKODRIVER_SKIP_DOWNLOAD*.

You can download another Geckodriver version by setting *process.env.GECKODRIVER_VERSION*.

```
GECKODRIVER_VERSION=0.26.0 node install.js
```

If you don't set a version, [the version](https://github.com/sitespeedio/geckodriver/blob/master/package.json#L4) in the *package.json* is used. 
