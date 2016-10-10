# zhike-consul

a simple consul client

### 1.consul(host, port)
Initialize a new Consul client

#### Options
+ host, default: 127.0.0.1
+ port, default: 8500

#### Usage
```js
var Consul = require('./index');
var consul = new Consul('172.16.3.2', 8500);
```

### 2.getNodeIp()
Get ip address of consul service is running

#### Usage
```js
consul.getNodeIp().then(function(data) {
  console.log(data);  // 172.16.3.2
})
```

### 3.set(key, value)
Set key/value (kv) pair.

#### Options
+ key(string): key
+ value(string|buffer): value

#### Usage
```js
consul.set('hello', 'world').then(function(data) {
  console.log(data);  // true
})
```

### 4.get(key)
Get value of the key.

#### Options
+ key(string): key

#### Usage
```js
consul.get('hello').then(function(data) {
  console.log(data);  // world
})
```

### Run Tests

```
npm test
```
