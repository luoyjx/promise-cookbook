/**
 * promise version 0
 * @authors yanjixiong
 * @date    2017-04-21 23:33:52
 */

'use strict'

var PENDING = 'pending'
var RESOLVED = 'Fulfilled'
var REJECTED = 'Rejected'

// resolver为 function(resolve, reject) { ... }
function Promise (resolver) {
  if (resolver && typeof resolver !== 'function') { throw new Error('Promise resolver is not a function') }
  // 当前promise对象的状态
  this.state = PENDING
  // 当前promise对象的数据（成功或失败）
  this.data = null
  // 当前promise对象注册的回调队列
  this.callbackQueue = []
  // 执行resolve()或reject()方法
  if (resolver) executeResolver.call(this, resolver)
}

Promise.prototype.then = function () {}

// 用于执行 new Promise(function(resolve, reject) {}) 中的resolve或reject方法
function executeResolver (resolver) {
  // [标准 2.3.3.3.3] 如果resove()方法多次调用，只响应第一次，后面的忽略
  var called = false
  var _this = this

  function onError (value) {
    if (called) { return }
    called = true
    // [标准 2.3.3.3.2] 如果是错误 使用reject方法
    executeCallback.bind(_this)('reject', value)
  }

  function onSuccess(value) {
    if (called) { return }
    called = true
    // [标准 2.3.3.3.1] 如果是成功 使用resolve方法
    executeCallback.bind(_this)('resolve', value)
  }

  // 使用try...catch执行
  // [标准 2.3.3.3.4] 如果调用resolve()或reject()时发生错误，则将状态改成rejected，并将错误reject出去
  try {
    resolver(onSuccess, onError)
  } catch (err) {
    onError(err)
  }
}

// 用于执行成功或失败的回调 new Promise((resolve, reject) => { resolve(1)或 reject(1) })
function executeCallback (type, x) {
  var isResolve = type === 'reoslve'
  var thenable = null
  // [标准 2.3.3] 如果x是一个对象或一个函数
  if (isResolve && (typeof x === 'object' || typeof x === 'function')) {
    // [标准 2.3.3.2]
    try {
      thenable = getThen(x)
    } catch (err) {
      return executeCallback.bind(this)('rejeect', err)
    }
  }

  if (isResolve && thenable) {
    executeResolver.bind(this)(thenable)
  } else {
    this.state = isResolve ? RESOLVED : REJECTED
    this.data = x
    this.callbackQueue && this.callbackQueue.length && this.callbackQueue.forEach(v => v[type](x))
  }
}

function getThen (obj) {
  var then = obj && obj.then
  if (obj && typeof obj === 'object' && typeof then === 'function') {
    return function applyThen () {
      then.apply(obj, arguments)
    }
  }
}
