# Geckodriver

This is a simple package that downloads [Geckodriver](https://github.com/mozilla/geckodriver) and 
provides a node api for accessing the path to the binary. With this package we try to minimize dependencies.


How to use?
```node
const driver = require('@sitespeed.io/geckodriver');

const binPath = driver.binPath();
// launch geckodriver from binPath
```

You can override where you download the Geckodriver by setting *process.env.GECKODRIVER_BASE_URL*. You can skip donwloading Geckodriver by setting *process.env.GECKODRIVER_SKIP_DOWNLOAD*.