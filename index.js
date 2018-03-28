'use strict';

const fs = require('fs');
const path = require('path');
const consul = require('consul');
const _Promise = require('bluebird');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8500;
const DEFAULT_TIMEOUT = 3000;

/**
 * Creates a ZhikeConsul instance
 * @constructor
 * @param {(number|string)} [port=8500]
 * @param {(string)} [host=localhost]
 * @param {(array)}  [keys=[c1, c2]]
 * @param{(object)}  [ref=global]
 * @param {object} [option.timeout=3000, option.output=process.cwd() + '/config.local.js']
 */
function ZhikeConsul(keys, host, port, ref, option) {
  if (!keys) {
    throw new Error('arguments must have configKeys');
  }

  // CFG应该挂到全局上
  ref = ref || global;

  host = host || DEFAULT_HOST;
  port = port || DEFAULT_PORT;
  const defaultOptioin = {
    timeout: DEFAULT_TIMEOUT,
    output: process.cwd() + '/config.local.js',
  };

  if (!isNaN(option)) {
    option = { timeout: option }; // 兼容 1.0.9
  }

  option = Object.assign({}, defaultOptioin, option);
  option.timeout = Math.min(Math.max(option.timeout, 1000), 30000);

  // 检查CFG是否存在
  if (ref.CFG) {
    throw new Error('please make sure that ref.CFG was not exist');
  }

  if(!(this instanceof ZhikeConsul)) {
    return new ZhikeConsul(keys, host, port, ref);
  }

  this.keys = keys;
  this.host = host;
  this.port = port;
  this.option = option;
  this.consul = consul({
    host: this.host,
    port: this.port,
    promisify: true,
    timeout: this.option.timeout,
  });

  // 初始化CFG为空对象
  this.ref = ref;
  this.ref.CFG = {};
  this.ref.config = {};
}

/**
 * Pull configs from origin server
 * @param {String} env 环境，如development、test或production
 */
ZhikeConsul.prototype.pull = _Promise.coroutine(function*(env) {
  env = env || 'development';

  // status check
  try {
    yield this.consul.health.checks('test');
  } catch(err) {
    console.log(err.stack);
    let privateKey;
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].indexOf('Private') !== -1) {
        privateKey = this.keys[i];
        this.ref.CFG[privateKey] = {};
        break;
      }
    }
    if (this.option.output) {
      this.ref.config = require(this.option.output);
      for (let key in this.ref.config) {
        if (this.keys.indexOf(key) !== -1) {
          this.ref.CFG[key] = this.ref.config[key];
        } else {
          this.ref.CFG[privateKey][key] = this.ref.config[key];
        }
      }
    }
    
    return {
      CFG: this.ref.CFG,
      config: this.ref.config
    }
  }

  for (let i = 0; i < this.keys.length; i++) {
    let key = this.keys[i];
    let data = yield this.consul.kv.get(key);
    if (data === undefined) {
      throw new Error(`config of ${key} does not exist`);
    }
    let value = JSON.parse(data.Value)[env];
    let assign = {};
    if (key.indexOf('Private') === -1) {
      assign[key] = value;
    } else {
      assign = value;
    }
    this.ref.CFG[key] = value;
    this.ref.config = Object.assign(this.ref.config, assign);
  }

  if (this.option.output) {
    // save to config.local.js
    let fileContent = "'use strict';\n\nmodule.exports = " + JSON.stringify(this.ref.config, null, 2);
    fs.writeFileSync(path.join(this.option.output), fileContent);
  }

  return {
    CFG: this.ref.CFG,
    config: this.ref.config
  }
});

/**
 * Register current service
 */
ZhikeConsul.prototype.register = function(data) {
  return this.consul.agent.service.register(data);
}

/**
 * Deregister current service
 */
ZhikeConsul.prototype.deregister = function(data) {
  return this.consul.agent.service.deregister(data);
}

/**
 * Get origin node's IP
 */
ZhikeConsul.prototype.getNodeIp = _Promise.coroutine(function*() {
  let nodes = yield this.consul.catalog.node.list();
  if (nodes.length === 0) {
    throw new Error('no nodes list');
  }
  return nodes[0]['Address'];
});

module.exports = ZhikeConsul;
