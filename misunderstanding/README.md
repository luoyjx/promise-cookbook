# 错误用法及误区

## 当做回调来用 callback hell
```javascript
loadAsync1().then(function(data1) {
  loadAsync2(data1).then(function(data2) {
    loadAsync3(data2).then(okFn, failFn)
  });
});
```

Promise是用来解决异步嵌套回调的，这种写法虽然可行，但违背了Promise的设计初衷
改成下面的写法，会让结构更加清晰

```
loadAsync1()
  .then(function(data1) {
    return loadAsync2(data1)
  })
  .then(function(data2){
      return loadAsync3(data2)
  })
  .then(okFn, failFn)
```

## 没有返回值
```
loadAsync1()
  .then(function(data1) {
    loadAsync2(data1)
  })
  .then(function(data2){
      loadAsync3(data2)
  })
  .then(res=>console.log(res))

```

promise 的神奇之处在于让我们能够在回调函数里面使用 return 和 throw。
所以在then中可以return出一个promise对象或普通的值，也可以throw出一个错误对象，但如果没有任何返回，将默认返回undefined，那么后面的then中的回调参数接收到的将是undefined，而不是上一个then中内部函数 loadAsync2 执行的结果，后面都将是undefined。

## 没有catch
```
loadAsync1()
  .then(function(data1) {
    return loadAsync2(data1)
  })
  .then(function(data2){
      return loadAsync3(data2)
  })
  .then(okFn, failFn)
```

这里的调用，并没有添加catch方法，那么如果中间某个环节发生错误，将不会被捕获，控制台将看不到任何错误，不利于调试查错，所以最好在最后添加catch方法用于捕获错误。

**添加catch**
```
loadAsync1()
  .then(function(data1) {
    return loadAsync2(data1)
  })
  .then(function(data2){
      return loadAsync3(data2)
  })
  .then(okFn, failFn)
  .catch(err=>console.log(err))

```

## `catch()`与`then(null, fn)`
在有些情况下catch与then(null, fn)并不等同，如下

```
ajaxLoad1()
  .then(res=>{ return ajaxLoad2() })
  .catch(err=> console.log(err))
```

此时，catch捕获的并不是ajaxLoad1的错误，而是ajaxLoad2的错误，所以有时候，两者还是要结合起来使用：
```
ajaxLoad1()
  .then(res=>{ return ajaxLoad2() }, err=>console.log(err))
  .catch(err=> console.log(err))
```

## 断链 The Broken Chain
```
function loadAsyncFnX(){ return Promise.resolve(1); }
function doSth(){ return 2; }
function asyncFn(){
  var promise = loadAsyncFnX()
    promise.then(function(){
    return doSth();
    })
  return promise;
}
asyncFn().then(res=>console.log(res)).catch(err=>console.log(err))
// 1
```

上面这种用法，从执行结果来看，then中回调的参数其实并不是doSth()返回的结果，而是loadAsyncFnX()返回的结果，catch 到的错误也是 loadAsyncFnX()中的错误，所以 doSth() 的结果和错误将不会被后而的then中的回调捕获到，形成了断链，因为 then 方法将返回一个新的Promise对象，而不是原来的Promise对象。

改写如下

```
function loadAsyncFnX(){ return Promise.resolve(1); }
function doSth(){ return 2; }
function asyncFn(){
  var promise = loadAsyncFnX()
    return promise.then(function(){
    return doSth();
    })
}
asyncFn().then(res=>console.log(res)).catch(err=>console.log(err))
// 2
```

## 穿透 Fall Through
```
new Promise(resolve=>resolve(8))
  .then(1)
  .catch(null)
  .then(Promise.resolve(9))
  .then(res=> console.log(res))
// 8
```

这里，如果then或catch接收的不是函数，那么就会发生穿透行为，所以在应用过程中，应该保证then接收到的参数始终是一个函数。

## 长度未知的串行与并行
并行执行

```
getAsyncArr()
  .then(promiseArr=>{
    var resArr = [];
    promiseArr.forEach(v=>{
      v().then(res=> resArr.push(res))
    })
    return resArr;
  })
  .then(res=>console.log(res))
```

使用forEach遍历执行promise，在上面的实现中，第二个then有可能拿到的是空的结果或者不完整的结果，因为，第二个then的回调无法预知 promiseArr 中每一个promise是否都执行完成，那么这里可以使用 Promise.all 结合 map 方法去改善

```
getAsyncArr()
  .then(promiseArr=>{
    return Promise.all(promiseArr);
  })
  .then(res=>console.log(res))
```

如果需要串行执行，那和我们可以利用数据的reduce来处理串行执行

```
var pA = [
  function(){return new Promise(resolve=>resolve(1))},
  function(data){return new Promise(resolve=>resolve(1+data))},
  function(data){return new Promise(resolve=>resolve(1+data))}
]
pA.reduce((prev, next)=>prev.then(next).then(res=>res),Promise.resolve())
.then(res=>console.log(res))
// 3
```

## `Promise.resolve`的用法

`Promise.reoslve` 有一个作用就是可以将 `thenable` 对象转换为 `promise` 对象。

`thenable` 对象，指的是一个具有 `.then` 方法的对象。
要求是 `thenable` 对象所拥有的 `then` 方法应该和 `Promise` 所拥有的 `then` 方法具有同样的功能和处理过程。
一个标准的 `thenable` 对象应该是这样的

```
var thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};
```

使用 Promise.resolve转换

```
Promise.resolve(thenable).then(function(value) {
  console.log(value);  // 42
});
```

同样具有标准的thenable特性的是 不同的实现Promise标准的类库，所以 ES6 Promise 与 Q 与buldbird 的对象都是可以互相转换的。

jQueyr的defer对象转换为ES6 Promise对象

```
Promise.resolve($.ajax('api/data.json')).then(res=>console.log(res)))
```

但也不是所有thenable对象都能被成功转换，主要看各种类库实现是否遵循 Promise/A+标准，不过此类使用场景并不多，不做深入讨论。