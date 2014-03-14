/**
 * Module dependencies
 */

var stack = require('simple-stack-common');
var proxy = require('simple-http-proxy');
var envs = require('envs');

/**
 * Create a proxy
 */

exports = module.exports = function(db, opts) {
  opts = opts || {};
  opts.secret = opts.secret || envs('SHARED_SECRET');

  if (!opts.secret) throw new Error('Must specify a secret');

  var app = stack(opts);

  installRoutes(app, db, opts);
  return app;
};

/**
 * Expose the express middleware
 */

stack.middleware(exports.middleware = {});

/**
 * Install the route handlers
 */

function installRoutes(app, db, opts) {
  app.get('/', function(req, res) {
    res.json({
      href: req.base,
      update: {
        action: req.base,
        method: 'POST',
        input: {
          app: {
            type: 'text',
            required: true
          },
          manifest: {
            type: 'application/x-simple-manifest',
            required: true
          }
        }
      }
    });
  });

  var auth = opts.authenticate || authenticate;

  app.post('/', auth(opts), function(req, res, next) {
    var id = req.body.app;
    var manifest = req.body.manifest;

    if (typeof manifest === 'string') try {
      manifest = JSON.parse(manifest);
    } catch (err) {
      return next(new Error('Could not read manifest'));
    };

    if (!manifest || !id) return next(new Error('missing required parameters'));

    db.replace(id, manifest, function(err) {
      if (err) return next(err);
      res.send(204);
    });
  });

  app.useBefore('router', '/build', function lookup(req, res, next) {
    var url = req.originalUrl.split('?')[0];
    db.lookup(url.substr(1), function(err, endpoints) {
      if (err) return next(err);
      if (!endpoints || !endpoints.length) return res.send(404);
      req.url = url;
      pipe(endpoints, req, res, next);
    });
  });

  app.use(function errorHandler(err, req, res, next) {
    res.json({
      href: req.base + req.url,
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  });
}

/**
 * Make the upstream requests
 *
 * TODO should we make a bunch of requests in parallel and
 *      return the first one?
 */

function pipe(endpoints, req, res, next) {
  var endpoint = endpoints.shift();
  proxy(endpoint)(req, res, function(err) {
    if (err) pipe(endpoints, req, res, next);
    res.send(404);
  });
}

function authenticate(opts) {
  return function (req, res, next) {
    var auth = (req.get('authorization') || '').replace(/^bearer /i, '');
    // TODO do a secure comparison
    if (!auth || opts.secret !== auth) return res.send(401);
    next();
  };
}
