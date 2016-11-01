# zhike-consul

a simple consul client

## Demo
```js
const Consul = require('zhike-consul');
const configKeys = ['optimus', 'db', 'redis', 'mq'];
const host = '127.0.0.1';
const port = 8500;

// 1.初始化consul
let consul = new Consul(configKeys, host, port, global);

// 2.加载相关配置
consul.pull().then(function() {
  // 3.启动HTTP Server
  let express = require('express');
  let app = express();
  initRedis(CFG.redis.host, CFG.redis.port);
  initDB(CFG.optimus.db);
  app.listen(CFG.optimus.port);
})
```
## API
### 1.consul(configKeys, host, port, global)
Initialize a new Consul client

#### Options
+ configKeys(array), 想要获取的配置文件的key值, 如['db', 'redis']
+ host(string), default: 127.0.0.1
+ port(number), default: 8500
+ global, global.CFG可以获取到相关的配置

#### Usage
```js
var Consul = require('zhike-consul');
var consul = new Consul(configKeys, host, port, global);
```

### 2.pull()
Get config values.

#### Usage
```js
consul.pull().then(function() {
  console.log(CFG.redis.port);  // 6379
})
```

### 3.register(data)
Register current service

#### Options
+ data, 服务注册的数据

#### Usage
```js
consul.register(data).then(function() {
  console.log('success');
})
```

### 4.getNodeIp()
Get ip address of consul service is running

#### Usage
```js
consul.getNodeIp().then(function(data) {
  console.log(data);  // 172.16.3.2
})
```

## Run Tests
```
npm test
```
