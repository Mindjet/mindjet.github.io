---
layout: post
title: React Redux 与胖虎他妈
date: 2018-01-12 17:18:05 +0800
categories: [coding, frontend, react-redux]
permalink: /:categories/:title
index: 6
---


本文将涉及以下三块内容：

* 多 Reducer
* 中间件
* 封装组件方便获取 Store

## 前言

在上一篇文章[《React Redux与胖虎》](https://mindjet.github.io/coding/frontend/react-redux/react-redux-with-bigG#) 中我们详尽地介绍了 React Redux，也写了一个简单的计数器。

这篇文章叫《React Redux与胖虎他妈》，因为在哆啦A梦里面，胖虎虽然很屌老是欺负大雄和小夫，但是在他妈面前没少挨揍，胖虎他妈还是他妈，所以这篇文章主要是介绍 React Redux 的一些进阶用法。

<img src="http://img1.dzwww.com:8080/tupian_pl/20170107/28/16100677357641277340.jpg" width=350 />

## 多 Reducer

### 单 Reducer 不好吗

开发过程中，我们由于业务或者功能的划分，一般不同模块的数据也是不同的，如果只用一个 Reducer，那么这个 Reducer 要处理所有模块过来的事件，然后返回一个 state，所有的数据都糅合在这个 state 里面，所有接收到这个 state 的模块还得解析出其中跟自己有关的部分。

所以单个 Reducer 并不能满足当下需求，多 Reducer 的出现有利于我们模块化开发，降低耦合度。

`redux` 提供了 `combineReducers` 函数来组合 Reducer，注意不是 `react-redux` 库。

```jsx
// reducers/index.js
import { combineReducers } from 'redux';
import firstReducer from './first-reducer';
import secondReducer from './second-reducer';

const reducers = combineReducers({ 
  firstReducer, 
  secondReducer 
});
```

注意上面 `combineReducers` 的参数使用 ES6 的语法，相当于：

```jsx
const reducers = combineReducers({ 
  firstReducer: firstReducer, 
  secondReducer: secondReducer
});
```

注意一点：**每发出一个事件，所有 Reducer 都会收到**。

### 多 Reducer 返回的 state

我们知道，在 Reducer 只有一个的情况下，容器组件的 `mapStateToProps` 函数接收到的 state 即为唯一 Reducer 返回的对象。

而在 Reducer 有多个的情况下，就会有多个返回值。这时候容器组件的 `mapStateToProps` 函数接收到的 state 其实是包含所有 Reducer 返回值的对象。可以用 key 值来区它们，这个 key 值就是我们在 `combineReducers` 时传入的。

```js
const mapStateToProps = (state) => {
  const firstReducer = state.firstReducer;
  const secondReducer = state.secondReducer;
  return {
    value1: firstReducer.value,
    value2: secondReducer.value
  };
}

export default connect(mapStateToProps)(Counter);
```

当然，一般都是只需要用其中一个 state，那么我们可以写成：

```js
const mapStateToProps = ({ firstReducer }) => {
  return {
      value: firstReducer.value
  };
}
//或者更加语义化地表示为state
const mapStateToProps = ({ firstReducer: state }) => {
  return {
      value: state.value
  };
}
```

这样一来可以有效地隔离各个模块之间的影响，也方便多人协作开发。

<img src="http://img.mp.itc.cn/upload/20170219/2cffe6ad27064f169d8fe87fbc413fa3_th.jpeg" width=200 />
（由于胖虎他妈实在没什么表情，所以还是用胖虎开涮吧）

## 中间件

网上对于中间件的解释基本上都是“位于应用程序和操作系统之间的程序”之类，这只是一个基本的概述。在 React Redux 里面，中间件的位置很明确，就是**在 Action 到达 Reducer 之前做一些操作**。

React Redux 的中间件实际上是一个高阶函数：

```js
function middleware(store) {
    return function wrapper(next) {
        return function inner(action) {
            ...
        }
    }
}
```

其中最内层的函数接收的正是 Action。

中间件可以多个叠加使用，在中间件内部使用 `next` 函数来将 Action 发送到下一个中间件让其处理。如果没有下一个中间件，那么会将 Action 发送到 Reducer 去。

我们看如何将中间件应用到 React Redux 应用中。

`redux` 提供了 `applyMiddleware`, `compose` 函数来帮助添加中间件：

```js
import { applyMiddleware, compose, createStore } from 'redux';
import api from '../middlewares/api';
import thunk from 'redux-thunk';
import reducers from "../reducers";

const withMiddleware = compose(
    applyMiddleware(api),
)(createStore);

const store = withMiddleware(reducers);

export default store;
```

可以看到 `applyMiddleware` 函数可以将中间件引入，使用 `compose` 函数将多个函数整合成一个新的函数。

对于 `applyMiddleware`, `compose`, `createStore` 这三个函数的实现，可以自己去参考源码。

这里说一下，这三个函数虽然代码量不大，但是其实用了挺多函数式编程的思想和做法，一开始看会很抽象，特别是几个箭头符号连着用更是懵逼。但是看源码总是好的，一旦你渐入佳境，定会发现新的天地。不过，这里就只讲用法了，说实话我也还没认真去看（逃

### 简单中间件

我们可以实现一个炒鸡简单的中间件来看看效果，比如说，在事件到达 Reducer 之前，把事件打印出来。

```js
export default store => next => action => {
  console.log(action);
  next(action);
}
```

emmmm，是挺简单的....

### 复杂中间件

在谈复杂中间件时，我们需要先说说同步事件、异步事件。

在 React Redux 应用中，我们平时发出去的事件都是直接到达中间件（如果有中间件的话）然后到达 Reducer，干净利落毫不拖拉，这种事件我们成为同步事件。

而异步事件，按照我个人理解，指的是，你发出去的事件，经过中间件时有了可观的时间停留，并不会立即传到 Reducer 里面处理。也就是说，这个异步事件导致事件流经过中间件时发生了耗时操作，比如访问网络数据、读写文件等，在操作完成之后，事件才继续往下流到 Reducer 那儿。

嗯...同步事件我们都知道怎么写：

```js
{
  type: 'SYNC_ACTION',
  ...
}
```

异步事件的话，一般是定义成一个函数：

```js
function asyncAction({dispatch, getState}) {
  const action = {
    type: 'ASYNC_ACTION',
    api: {
      url: 'www.xxx.com/api',
      method: 'GET'         	
    }
  };
  dispatch(action);
}
```

但是，现在我们的异步事件是一个函数，你如果不作任何处理的话直接执行 `dispatch(asyncAction)` ，那么会报错，告诉你只能发送 plain object，即类似于同步事件那样的对象。

### redux-thunk

我们要在中间件搞些事情，让函数类型的 Action 可以用，简单地可以使用 [redux-thunk](https://github.com/gaearon/redux-thunk) 。

P.S. 虽然我不是专门搞前端的，虽然我是男的，但是作者 [gaearon](https://github.com/gaearon) 真的好帅......

`redux-thunk` 的代码量十分地少... 贴出来看看：

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;

```

![胖虎都懒得看](https://pic4.zhimg.com/50/v2-c5d28aebcac3428c6d41e702bfbfb838_hd.jpg)

emmmm，其实它做的事情就是判断传进来的 Action 是不是 `function` 类型的，如果是，就执行这个 action 并且把 `store.dispatch` 和 `store.getState` 传给它；如果不是，那么调用 `next` 将 Action 继续往下发送就行了。

### 带有网络请求的中间件

行吧... 那我们仿照 `redux-thunk` 写一个中间件，整合进网络请求的功能。

1. 首先当然是允许 function 类型的 Action

   ```js
   export default store => next => action => {
       if (typeof action === 'function') {
           return action(store);
       }
   }
   ```

2. 然后当 Action 是 plain object 而且没有 `api` 字段时，当成同步事件处理

   ```js
   export default store => next => action => {
       if (typeof action === 'function') {
           return action(store);
       }

       const { type, api, isFetching, ...rest } = action;
       if (!api) {
           return next(action);
       }
   }
   ```

3. 如果有 `api` 字段，那么先发送一个事件，告诉下游的 Reducer 我先要开始来拿网络数据了嘿嘿，即 `isFetching` 字段值为 true

   ```js
   export default store => next => action => {
       if (typeof action === 'function') {
           return action(store);
       }

       const { type, api, isFetching, ...rest } = action;
       if (!api) {
           return next(action);
       }

       next({ type, api, isFetching: true, ...rest });
   }
   ```

4. 然后就开始进行异步操作，即网络请求。并且请求成功、请求失败和请求异常三种情况都会发送不同的事件给下游的 Reducer

   ```js
   import fetch from 'isomorphic-fetch';
   import React from "react";

   export default store => next => action => {
       if (typeof action === 'function') {
           return action(store);
       }

       const { type, api, isFetching, ...rest } = action;
       if (!api) {
           return next(action);
       }

       next({ type, api, isFetching: true, ...rest });

       fetch(api.url, {
           method: api.method,
       }).then(response => {
           if (response.status !== 200) {
               next({
                   type,
                   api,
                   status: 'error',
                   code: response.status,
                   response: {},
                   isFetching: false,
                   ...rest
               });
           } else {
               response.json()
                   .then(json => {
                       next({
                           type,
                           api,
                           status: 'success',
                           code: 200,
                           response: json.response,
                           isFetching: false,
                           ...rest
                       });
                   })
           }
       }).catch(err => {
           next({ type, api, status, code: 0, response: {}, isFetching: false, msg: err, ...rest });
       });
   }
   ```

到此为止，一个比较复杂的带有网络请求的中间件就完成了。

## 封装组件方便获取 Store

### 遗留的问题

还记得上一篇文章我们说到“一个深度为 100 的组件要去改变一个浅层次组件的文案”的例子吗？我们当时说，只要从深层次的组件里面发送一个事件出来就可以了，也就是使用 dispatch 函数来发送。

emmmm，我们到现在好像还没遇到过直接在组件里面 dispatch 事件的情况，我们之前都是在容器组件的 `mapDispatchToProps` 里面 dispatch 的。

所以在 UI 组件里面不能拿到 dispatch 函数？

这里先说明一点，我们亲爱的 dispatch 函数，是存在于 Store 中的，可以用 Store.dispatch 调用。有些机灵的同学已经想到，那我们全局的 Store 引入 UI 组件不就好咯。

哦我亲爱的上帝，瞧瞧这个优秀的答案，来，我亲爱的汤姆斯·陈独秀先生，这是你的奖杯...

是的没错，这是一种方式，但是我觉得这很不 React Redux。

![不给胖虎面子](https://pic3.zhimg.com/50/v2-43fb2adff31a80545521fcdd097ec5ae_hd.jpg)

### 利用 this.context

在上一篇文章中，我们说到引入了 `Provider` 组件来讲 Store 作用于整个组件树，那么是否在每一个组件中都能获取到 Store 呢？

当然可以，Store 是穿透到整个组件树里面的，这个特性依赖于 `context` 这个玩意，`context` 具体的介绍可以参看 [官方文档](https://reactjs.org/docs/context.html) 。

只需要在顶层的组件声明一些方法就可以实现穿透，这部分工作 Provider 组件内部已经帮我们做好了。

不过在想使用 Store 的组件内部，也要声明一些东西才能拿到：

```jsx
import PropTypes from 'prop-types';

export default class DeepLayerComponent extends React.Component {
  
  static contextTypes = {
      store: PropTypes.object
  }

  componentDidMount() {
      this.context.store.dispatch({type: 'DO_SOMETHING'});
  }
  
}
```

这里我们声明 `contextTypes` 的 `store` 字段，然后就可以通过 `this.context.store` 来使用了。

注意，**由于 `react` 库自带的 `PropTypes` 在 15.5 版本之后抽离到 `prop-types` 库中，需要自行引入才能使用**。

### 封装

但是如果每个要使用 Store 的组件都这么搞，不得累死，所以我们考虑做一下封装，创建一个能通过 `this.store` 就能拿到全局 Store 的组件。

```jsx
import React from "react";
import PropTypes from 'prop-types';

export default class StoreAwareComponent extends React.Component {

    static contextTypes = {
        store: PropTypes.object
    };

    componentWillMount() {
        this.store = this.context.store;
    }

}
```

嘿嘿，然后你只要继承这个组件就可以轻松拿到全局 Store 了。

```js
import React from "react";
import PropTypes from 'prop-types';

export default class DeepLayerComponent extends StoreAwareComponent {

  componentDidMount() {
      this.store.dispatch({type: 'DO_SOMETHING'});
  }
  
}
```

###    

这篇我就不作总结了。（逃

