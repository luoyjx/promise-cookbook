# promise-cookbook
learn how to cook promise

## Promise 标准描述

标准中规定：

1. Promise对象初始状态为 `Pending`，在被 `resolve` 或 `reject` 时，状态变为 `Fulfilled` 或 `Rejected`
1. resolve接收成功的数据，reject接收失败或错误的数据
1. Promise对象必须有一个 `then` 方法，且只接受两个可函数参数 `onFulfilled`、`onRejected`

## then方法

标准中规定：

1. then 方法必须返回一个新的 `Promise实例`（ES6中的标准，Promise/A+中没有明确说明）
1. 为了保证 then中回调的执行顺序，`onFulfilled` 或 `onRejected` 必须异步调用

## 扩展方法实现

### `Promise.all`

```
Promise.all = function(iterable){
  var _this = this;
  return new this(function(resolve, reject){
    if(!iterable || !Array.isArray(iterable)) return reject( new TypeError('must be an array') );
    var len = iterable.length;
    if(!len) return resolve([]);
    var res = Array(len), counter = 0, called=false;
    iterable.forEach(function(v, i){
      (function(i){
        _this.resolve(v).then(function(value){
          res[i]=value;
          if(++counter===len && !called){
            called = true;
            return resolve(res)
          }
        }, function(err){
          if(!called){
            called = true;
            return reject(err);
          }
        })
      })(i)
    })
  })
}
```
