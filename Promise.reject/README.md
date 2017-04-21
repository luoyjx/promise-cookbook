# Promise.reject()
同`Promise.resolve()`，不同的是返回的promise对象的状态为rejected

* 将现有对象转换为Promise对象
* 如果参数是promise实例，则直接返回这个实例
* 如果参数是thenabled对象（有then方法的对象），则先将其转换为promise对象，然后立即执行这个对象的then方法
* 如果参数是个原始值，则返回一个promise对象，状态为rejected，这个原始值会传递给回调
* 没有参数，直接返回一个rejected的Promise对象