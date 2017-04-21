# promise-cookbook
learn how to cook promise

# Promise 标准描述

标准中规定：

1. Promise对象初始状态为 `Pending`，在被 `resolve` 或 `reject` 时，状态变为 `Fulfilled` 或 `Rejected`
1. resolve接收成功的数据，reject接收失败或错误的数据
1. Promise对象必须有一个 `then` 方法，且只接受两个可函数参数 `onFulfilled`、`onRejected`

# then方法

标准中规定：

1. then 方法必须返回一个新的 `Promise实例`（ES6中的标准，Promise/A+中没有明确说明）
1. 为了保证 then中回调的执行顺序，`onFulfilled` 或 `onRejected` 必须异步调用