'use strict';

const Consul = require('../index');
const consul = new Consul('172.16.3.2', 8500);
const expect = require('chai').expect;

describe('Consul', function() {
  describe('#getNodeIp', function() {
    it('should get node ip when servie is running', function() {
      consul.getNodeIp().then(function(data) {
        expect(data).equal('172.16.3.2');
      })
    })
  });

  describe('#set', function() {
    it('should return true when operation is right', function() {
      consul.set('hello', 'world').then(function(data) {
        expect(data).equal(true);
      })
    })
  });

  describe('#get', function() {
    it('should get config information when config key exist', function() {
      consul.get('hello').then(function(data) {
        expect(data).equal('world');
      })
    })
  });
});
