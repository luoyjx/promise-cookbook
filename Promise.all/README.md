# Promise.all()

* 接收一个Promise实例的数组或具有Iterator接口的对象
* 如果元素不是Promise对象，则使用Promise.resolve转成Promise对象
* 如果全部成功，状态变为resolved，返回值将组成一个数组传给回调
* 只要有一个失败，状态就变为rejected，返回值将直接传递给回调
* all() 的返回值也是新的Promise对象