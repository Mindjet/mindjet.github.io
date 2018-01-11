---
layout: post
title: React Redux 与胖虎
date: 2018-01-11 18:21:05 +0800
categories: [coding, frontend, react-redux]
permalink: /:categories/:title
index: 12
---


## 是什么

[React Redux](https://github.com/reactjs/react-redux) 是 [Redux](https://redux.js.org/) 的 React 版，Redux 本身独立于其他框架而存在，又可以结合其他视图框架使用，比如此处的 React。

## 干嘛的

按个人理解，Redux 是应用的状态管理框架，以事件流的形式来发送事件、处理事件、操作状态和反馈状态。

这么说还是太抽象了，举个简单的例子。比如有个 A 组件，它要改变它自己的一个 div 里面的文字，假设这个文字内容由 `this.props.content` 决定，那么它可以发送一个事件，这个事件经过一系列的处理，最终会改变 `this.props.content`。

龟龟，这也太秀了吧，改个文字都得这么复杂？没错，如果是这种情况去用 React Redux，那简直就是画蛇添足，没事找事。这里有一篇文章 *[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)*，可以考虑自己编写的应用，是否真的需要 React Redux。

回到上面的例子，倘若 A 组件要去改变同级的一个 B 组件里面的文字呢？按照我们之前的做法，我们会在 A B 组件的上一层套上一个 Parent 组件，将修改 B 组件文字的方法传给 A 组件，A 组件调用后改变 Parent 组件的 state，进而改变 B 组件的文字。

那么我们的代码大约是这个样子：

```jsx
//Parent 组件
render() {
    return (
      <div>
        <A onClick={(newContent) => this.setState({content: newContent})}/>
        <B content={this.state.content}/>
      </div>
    )
}

//A 组件
render() {
    return (
      <div onClick={() => this.props.onClick('This is new content for B')}>Change B's content</div>
    )
}

//B 组件
render() {
    return (
      <div>{this.props.content}</div>
    )
}
```

有点费劲呢...可是我们总算实现了功能~

什么？多加了个同级的 C 组件，也要 A 组件来改变里面的文字...

什么？有个深度为 100 的组件，要它来改变 B 组件的文字...

我胖虎出去抽根烟，回来要看到这两个功能实现，不然锤死在座各位。

![](https://pic4.zhimg.com/50/v2-bb01973fa1cb1f6862706ea8b3f3e1f4_hd.jpg)

为了实现这两个功能，回调函数满天飞，特别是第二个功能，你得把回调函数往下传 100 层...

差不多这个时候，你就该考虑 React Redux 了。

像第二个功能，只需要从深层的组件发送一个事件出来，这个事件最终就会改变 B 组件的文字。

嗬，听起来不错。

## 长啥样

讲了这么多，是时候一睹 React Redux 的真容。

![RR架构](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1515666628864&di=7132b1a91662cd6db0dd880f08fbccca&imgtype=0&src=http%3A%2F%2Fimg.colabug.com%2F2017%2F08%2F369dd79c71f4bf2d8c1695445a248ef9.jpg)

其中 Action、Dispatch 和 Reducer 都是 React Redux 的东西，View 则是代表我们的视图层 React。

先理清几个概念：Store，Action 和 Reducer（Dispatch 是 Store 的一个方法）

* Store 是整个 React Redux 应用总的状态容器，是一个对象
* Action 也是一个对象，表明事件，需要有 `type` 字段
* Reducer 是一个函数，会根据不同 Action 来决定返回不同的数据

从上面的图看到 View 层可以通过两种方式来更新：

1. View 层发出 Action，Dispatch 之后到达 Reducer，Reducer 处理后返回新的东西去更新 View
2. 其它层发出 Action 以同样的方式来更新 View

上面无论哪一种方式，都是遵循单向数据流的规则，即：**发送 Action -> Reducer 根据 Action 返回数据 -> Store 被更新 -> View 被更新**。

## 从 demo 讲起

空谈误国，实干兴邦。还是边写边介绍为好。

这里实现一个小 demo，就一个按钮和一个数字，点击按钮数字加 1，即计数器。

先说一点，**React Redux 将组建区分为 容器组件 和 UI 组件**，前者会处理逻辑，后者只负责显示和交互，内部不处理逻辑，状态完全由外部掌控。

“老子有的组件又负责显示又负责处理逻辑，你怕不是在为难我胖虎”

![](https://pic1.zhimg.com/50/v2-1033f52e47848b298f87261b5baaad5b_hd.jpg)

是的，很多情况都是这样，所以一般做法是在外面封装一层，将逻辑和 UI 剥离，外层写逻辑，内层纯粹写 UI。

所以对于计数器这个组件，我们需要多封装一层，使用的是 `react-redux` 的 `connect` 函数。这个函数顾名思义就是连接用的，连接 UI 组件，生成新的含有逻辑的组件。

`connect` 是一个高阶函数，可以传入两个函数：

```jsx
import { connect } from 'react-redux';
import Counter from './Counter';

function mapStateToProps(state) {
    return {
        count: state.count
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onAdd: () => dispatch({type: 'ADD_COUNT'})
    }
}

const newComponent = connect(mapStateToProps, mapDispatchToProps)(Counter);
```

`connect` 函数可以传入两个函数：

#### mapStateToProps

此函数接收 state 参数（后面会讲到，这个 state 是从 reducer 那里过来的），定义从 state 转换成 UI 组件 props 的规则。该函数返回 props 对象，比如我们取 state 的 `count` 字段生成新的 props 返回。

此函数还可以接收 ownProps 参数，代表直接在 UI 组件上声明的 props：

```jsx
function mapStateToProps(state, ownProps) {
    console.log(ownProps);	//{content: 'hello', color='white'}
  	return {};
}
 
//比如我们是这么使用 Counter 组件的
<Counter content='hello', color='white' />
```

#### mapDispatchToProps

此函数接收 dispatch 参数（实际上是 Store 的 dispatch 方法），定义一系列发送事件的方法，并返回 props 对象。比如上面我们定义发送 `ADD_COUNT` 事件的方法 `onAdd`，其中 `{type: 'ADD_COUNT'}` 就是一个简单的 Action 了。

等等，胖虎有话要说。

![](https://pic3.zhimg.com/50/v2-56d5beb2f0561608243b5e853df94dc6_hd.jpg)

你说 `mapStateToProps` 返回 UI 组件的 props，`mapDispatchToProps` 也返回 UI 组件的 props，同时 UI 组件自己还定义了 props，那他娘的最后 UI 组件的 props 是什么啊？

答案是，**这 3 个 props 合在一块**。也就是说，照上面的例子，在 Counter 组件内部可以调用到这些：

```jsx
this.props.content;
this.props.color;
this.props.count;
this.props.onAdd();

export default class Counter extends React.Component {
    
  render() {
      return (
        <div>
          <p>{this.props.count}</p>
          <button onClick={this.props.onAdd}>Add</button>
        </div>
      )
  }
}
```

恩，用 `connect` 就把外层的容器组件构造好了，我们把刚刚那个含有 `connect` 函数的文件命名为 `index.jsx`。

### Reducer

我们刚刚写的那个 Counter，其实还不能用，因为我们发送事件出去之后，并没有对事件进行处理。

Reducer 就是用来处理 Action 的，实际上是一个函数，比如我们处理上面提到的 `ADD_COUNT` 事件：

```jsx
//counter-reducer.js
export default function reducer(state={count: 0}, action) {
    switch(action.type) {
      case 'ADD_COUNT':
        return {
            count: state.count + 1
        };
      default:
        return state;
    }
}
```

像这里，如果我们判断事件 type 是 `ADD_COUNT` 时，将 state 里面的 `count` 字段属性值 +1 并且返回新的 state 对象，这个对象会传到 `mapStateToProps` 中。

Reducer 函数里面有 2 点值得注意：

* 第一个参数 state 表明当前的 state，比如说当数字为 1 时点击 Add 按钮，此时在 Reducer 中该 state 为 `{count: 1}`，随后返回 `{count: 2}`，再下次进来就是 `{count: 2}` 了。state 可以传入初始化值，比如咱们这里初始值为 0
* **任何事件所有的 Reducer 都可以接收到**，若 Reducer 没有匹配的 case，代表不响应这个事件，要返回当前的 state，即 default 分支返回 state。

### Store

有人又好奇了，那这个 state 到底是存在于哪里的？目前我们讨论到的 Reducer 和 `mapStateToProps` 函数，它们都是接受 state，本身并不持有 state。

![。。。](https://pic4.zhimg.com/50/v2-43fb2adff31a80545521fcdd097ec5ae_hd.jpg)

实际上，state 存在于 Store 中。后面还会讲到，多个 Reducer 的情况下，一个 Reducer 对应 Store 中的一个 state。

那么，Store 又是怎么作用到我们的 DOM 树上的？

React Redux 是通过 Provider 组件将 Store 这一个全局状态容器绑定到 DOM 树上，Provider 一般作为 React Redux 应用最顶层的组件（Provider 并不真实存在于 DOM 树上）：

```jsx
import { createStore, Provider } from 'react-redux';
import React from 'react';
import reducer from './counter-reducer.js';
import Counter from './components/Counter';

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <Counter/>
  </Provider>, document.getElementById('root'));
```

可以看到我们从 `react-redux` 这个库引入了 `createStore` `Provider`，并使用 `createStore` 传入上面的 Reducer 创建出 Store，再将 Store 传到 Provider 组件，从而作用于整个 DOM 结构。

此时的项目结构为（当然还有其他一些 webpack 配置文件什么的，就不列举了）：

```bash
Project
	- components
		- Counter
			- index.jsx
			- Counter.jsx
	- index.jsx
```

到此为止，这个计数器已经能正常地运作了。

我们也稍微理解了 React Redux 的工作原理和方式了，再总结一番：

* 事件流：dispatch(Action) -> Reducer -> new state (Store) -> new props -> update component
* 分为容器组件和 UI 组件，传统组件可能需要用 connect 作处理
* Reducer 处理 Action 返回新的 state，需考虑 Action 不匹配的情况
* 使用 createStore 函数创建 Store，Reducer 作为参数
* 使用 Provider 作为顶层组件将全局 Store 引入

![胖虎射线](http://imgsrc.baidu.com/forum/w%3D580/sign=73616351a76eddc426e7b4f309dab6a2/9611702762d0f703ec1ad86802fa513d2797c5d8.jpg)

