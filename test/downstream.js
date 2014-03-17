var stack = require('simple-stack-common');

var app = module.exports = stack();

app.get('/build/cache-123-build.js', function(req, res) {
  res.set('content-type', 'text/javascript');
  res.send('alert("Hello!");');
});
