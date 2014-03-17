simple-assets-proxy
===================

Share assets across applications

Installation
------------

```sh
$ npm install --save simple-assets-proxy
```

Usage
-----

```js
// app.js
var proxy = require('simple-assets-proxy');
var db = require('./db');

var app = module.exports = proxy(db, {
  secret: 'MY_SHARED_SECRET' // this secret should be shared across app servers and be sent every time there is a manifest update
});
```

```js
// db.js
exports.replace = function(name, manifest, cb) {
  // will be called anytime there is a new manifest
};

exports.lookup = function(path, cb) {
  // will be called anytime there is a request for an asset.
  // this function should cb() an array of endpoints that host
  // the particular asset
}
```

Tests
-----

```sh
$ npm test
```
