var proxy = require('./');

var db = {};

db._entries = {};

db.replace = function(name, manifest, cb) {
  var entry = JSON.parse(manifest);
  var set = db._entries[name] = {};
  Object.keys(entry).forEach(function(k) {
    set[entry[k]] = true;
  });
  console.log(db._entries);
  cb();
};

db.lookup = function(path, cb) {
  var endpoints = [];

  console.log('looking up', path);

  Object.keys(db._entries).forEach(function(endpoint) {
    var entry = db._entries[endpoint];
    if (entry[path]) endpoints.push(endpoint);
  });

  console.log('got results for', path, endpoints);

  cb(null, endpoints);
};

var app = module.exports = proxy(db, {
  secret: 'secret'
});
