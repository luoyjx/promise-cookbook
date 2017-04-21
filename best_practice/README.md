# 最佳实践

* then方法中 永远 return 或 throw
* 如果 promise 链中可能出现错误，一定添加 catch
* 永远传递函数给 then 方法
* 不要把 promise 写成嵌套