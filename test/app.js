var proxy = require('../');

var db = {};

db._entries = {};

db.replace = function(name, entry, cb) {
  var set = db._entries[name] = {};
  Object.keys(entry).forEach(function(k) {
    set[entry[k]] = true;
  });
  cb();
};

db.lookup = function(path, cb) {
  var endpoints = [];

  Object.keys(db._entries).forEach(function(endpoint) {
    var entry = db._entries[endpoint];
    if (entry[path]) endpoints.push(endpoint);
  });

  cb(null, endpoints);
};

var app = module.exports = proxy(db, {
  secret: 'secret'
});

app._db = db;
