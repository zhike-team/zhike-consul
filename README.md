# zhike-consul

a simple consul client

## Demo
```js
const Consul = require('zhike-consul');
const keys = ['orderPrivate', 'mq', 'userService'];
const host = '127.0.0.1';
const port = 8500;
const env = 'development';
const timeout = 3000;

// 1.初始化consul
let consul = new Consul(keys, host, port, global, timeout);

// 2.加载相关配置
consul.pull(env).then(function(data) {
  /**
    data = {
      CFG: {
        orderPrivate: {port: 6002, timeout: 10},
        mq: {user: 'test', pass: 'test'},
        userService: {url: 'http://api.dev.smartstudy.com/user'}
      },
      config: {
        port: 6002,
        timeout: 10,
        mq: {user: 'test', pass: 'test'},
        userService: {url: 'http://api.dev.smartstudy.com/user'}
      }
    }
  */
  /** 每个key的配置信息会默认挂载在global的CFG对象下
    global.CFG = data.CFG
  */

  /** global的config对象会以私有配置为准，把其余的key的配置信息平铺在一起
    global.config = data.config;
  */

  // 3.启动HTTP Server
  let express = require('express');
  let app = express();
  let mq = amqplib.connect('amqp://' + config.mq.user + ':' + config.mq.pass + '@' + config.mq.host + ':' + config.mq.port);
  app.listen(config.port);
})
```
## API
### 1.consul(keys, host, port, global)
Initialize a new Consul client

#### Options
+ keys(array), 想要获取的配置文件的key值, 如['db', 'redis']
+ host(string), default: 127.0.0.1
+ port(number), default: 8500
+ global, global.CFG可以获取到相关的配置
+ timeout, 超时时间，默认为3000，可以按需指定，最大不能超过30000，单位是毫秒

#### Usage
```js
var Consul = require('zhike-consul');
var consul = new Consul(keys, host, port, global, timeout);
```

### 2.pull(env)
Get config values.

#### Options
+ env(string), 指定拉取哪个环境的配置信息, 如development、test或production，默认development

#### Usage
```js
consul.pull('development').then(function(data) {
  console.log(data.CFG.redis.port); // 6379
  console.log(data.config.redis.port); // 6379
  // 或直接用global对象CFG和config
  console.log(config.redis.port); // 6379
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
