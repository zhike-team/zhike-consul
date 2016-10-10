'use strict';

const consul = require('consul');

// 构造函数
function Consul(host, port) {
  host = host || '127.0.0.1';
  port = port || 8500;
  this.consul = consul({
    host: host,
    port: port,
    promisify: true
  });
}

// 注册服务
Consul.prototype.register = function(data) {
  return this.consul.agent.service.register(data);
}

// 注销服务
Consul.prototype.deregister = function(data) {
  return this.consul.agent.service.deregister(data);
}

// 获取当前服务所在节点的ip
Consul.prototype.getNodeIp = function() {
  let that = this;
  return new Promise(function(resolve, reject) {
    that.consul.catalog.node.list().then(function(nodes) {
      resolve(nodes[0]['Address']);
    }, function(err) {
      reject(err);
    })
  });
}

// 设置consul存储的信息
Consul.prototype.set = function(key, value) {
  let that = this;
  return new Promise(function(resolve, reject) {
    that.consul.kv.set(key, value).then(function(data) {
      resolve(data);
    }, function(err) {
      reject(err);
    })
  });
}

// 获取consul存储的信息
Consul.prototype.get = function(key) {
  let that = this;
  return new Promise(function(resolve, reject) {
    that.consul.kv.get(key).then(function(data) {
      try {
        data.Value = JSON.parse(data.Value);
      }
      catch (err) {
        console.log(err);
      }
      resolve(data.Value);
    }, function(err) {
      reject(err);
    })
  });
}

module.exports = Consul;
