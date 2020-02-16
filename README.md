GECKO# Geckodriver

This is a simple package that downloads [Geckodriver](https://github.com/mozilla/geckodriver) and 
provides a node api for accessing the path to the binary. With this package we try to minimize dependencies.


How to use?
```node
const driver = require('@sitespeed.io/geckodriver');

const binPath = driver.binPath();
// launch geckodriver from binPath
```

You can override where you download the Geckodriver by setting *process.env.GECKODRIVER_BASE_URL*. You can skip donwloading Geckodriver by setting *process.env.GECKODRIVER_SKIP_DOWNLOAD*.

You can download another Geckodriver version by setting *process.env.GECKODRIVER_VERSION*.

```
GECKODRIVER_VERSION=0.26.0 node install.js
```

If you don't set a version, [the version](https://github.com/sitespeedio/geckodriver/blob/master/package.json#L4) in the *package.json* is used. 
