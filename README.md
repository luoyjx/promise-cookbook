# promise-cookbook
learn how to cook promise

## implementation

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