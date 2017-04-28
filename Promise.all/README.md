# Promise.all()

* 接收一个Promise实例的数组或具有Iterator接口的对象
* 如果元素不是Promise对象，则使用Promise.resolve转成Promise对象
* 如果全部成功，状态变为resolved，返回值将组成一个数组传给回调
* 只要有一个失败，状态就变为rejected，返回值将直接传递给回调
* all() 的返回值也是新的Promise对象

## 正确的实现
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

这里的实现，要注意一点的是，**即要保证全部成功，又要保证按数组里原来的顺序返回结果**，
在一开始的实现里，我并没有考虑到这个问题，所以最初的实现是没有添加闭包的，
那么结果就是数组里的promise谁先成功，谁的结果就占据了第一个位置，就算这个promise是数组的最后一个

## 错误的实现
```
Promise.all = function(iterable){
  var _this = this;
  return new this(function(resolve, reject){
    if(!iterable || !Array.isArray(iterable)) return reject( new TypeError('must be an array') );
    var len = iterable.length;
    if(!len) return resolve([]);
    var res = Array(len), counter = 0, called=false;
    iterable.forEach(function(v){
        _this.resolve(v).then(function(value){
          res[counter] = value;
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
    })
  })
}
```

这样导致的结果就是，返回的结果数组与原来的数组不能一一匹配，上面的测试就会返回 [2, 1]

