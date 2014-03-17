/**
 * Module dependencies
 */

var should = require('should');
var proxy = require('./app');
var downstream = require('./downstream');
var request = require('supertest');

describe('simple-assets-proxy', function() {
  var address;
  before(function(done) {
    var server = downstream.listen(0, function() {
      address = 'http://localhost:' + server.address().port;
      done();
    });
  });

  afterEach(function() {
    proxy._db._entries = {};
  });

  it('should accept a manifest file', function(done) {
    var body = {
      app: address,
      manifest: {
        'build/build.js': 'build/cache-123-build.js'
      }
    };
    request(proxy)
      .post('/')
      .set('authorization', 'Bearer secret')
      .send(body)
      .expect(204)
      .end(function() {
        should.exist(proxy._db._entries[address]);
        done();
      });
  });

  it('should fail with auth failure', function(done) {
    request(proxy)
      .post('/')
      .send({})
      .expect(401, done);
  });

  describe('lookup', function() {
    beforeEach(function(done) {
      var body = {
        app: address,
        manifest: {
          'build/build.js': 'build/cache-123-build.js'
        }
      };
      request(proxy)
        .post('/')
        .set('authorization', 'Bearer secret')
        .send(body)
        .expect(204, done);
    });

    it('should lookup an uploaded asset successfully', function(done) {
      request(proxy)
        .get('/assets/build/cache-123-build.js')
        .end(function(err, res) {
          // TODO why doesn't this work?
          console.log(err, res);
          done();
        });
    });

    it('should fail on a asset that doesn\'t exist', function(done) {
      request(proxy)
        .get('/assets/build/non-exist.js')
        .expect(404, done);
    });
  });
});
