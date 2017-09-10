# Geckodriver

This is a simple package that downloads [Geckodriver](https://github.com/mozilla/geckodriver) and 
provides a node api for accessing the path to the binary. There are other packages like this, but I wanted to make sure
I had an updated package to include in [Browsertime](http://www.browsertime.net).

How to use?
```node
const driver = require('@sitespeed.io/geckodriver');

const binPath = driver.binPath();
// launch geckodriver from binPath
```