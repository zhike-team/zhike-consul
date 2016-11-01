'use strict';

const Consul = require('../index');
const configKeys = ['optimus'];
const consul = new Consul(configKeys, '172.16.3.2', 8500, global);
const expect = require('chai').expect;

describe('Consul', function() {
  describe('#getNodeIp', function() {
    it('should get node ip when servie is running', function() {
      consul.getNodeIp().then(function(data) {
        expect(data).equal('172.16.3.2');
      })
    })
  });

  describe('#pull', function() {
    it('should get config information when config key exist', function() {
      consul.pull().then(function() {
        expect(CFG.optimus.port).equal(7004);
      })
    })
  });
});
