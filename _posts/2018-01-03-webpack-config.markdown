---
layout: post
title: webpack 配置杂谈
date: 2018-01-03 18:16:05 +0800
categories: [coding, frontend, webpack]
permalink: /:categories/:title
index: 10
---

webpack 配置工作主要集中在 `webpack.config.js` 文件中，该文件最终输出一个对象来声明配置。对象中有多个常用字段，以下进行说明并不定期更新。

## entry

entry 字段声明了打包的入口文件，webpack 会根据入口文件来找到直接或者间接依赖的文件。

下面讨论该字段的语法。

### 单个入口

```js
entry: './index.js'
```

### 带有 key 的一个或多个入口

```js
entry: {
    main: './index.js',
	branch: './index.branch.js'
}
```

## output

output 字段声明了 webpack 如何输出编译文件，当入口文件有多个时，仍输出一个文件。

output 字段的值是一个对象，对象中有多个字段可以定制。

### path

指定编译输出的目录。

```js
output: {
    path: './build/js'
}
```

### filename

指定编译文件的名字。可以使用 `[name] [chunkhash] [hash]` 等占位符，具体的概念和使用参照[文档。](https://doc.webpack-china.org/configuration/output#output-filename)

```js
output: {
    filename: '[name].bundle.js'	//此处的name是entry中声明的key值，默认为main
}
```

### publicPath

指定公用资源的 URL 前缀。比如说图片托管在 CDN 服务器上，明显跟项目代码不在同一个 URL 下，那么需要指定。

```js
output: {
    publicPath: 'https://cdn.dump.com/assets/'
}
```

代码中使用资源：

```css
background-image: url(/img/icon.png);
```

## loaders

loaders 是处于 `module` 字段下的字段，定义 webpack 如何对模块的源代码进行处理。

基本结构如下：

```js
module: {
    loaders: [
      
    ]
}
```

对于每个 loader 对象，有几个字段可以定制。

### test

使用正则表达式匹配文件，比如匹配 js/jsx 文件。

```js
loaders: [
    {
        test: /\.js|jsx$/
    }
]
```

### exclude/include

指定哪些文件被当前 loader 排除/处理。

```js
loaders: [
    {
      	test: /\.js|jsx$/,
        exclude: /node_modules/
    }
]
```

### loader/loaders

指定对于 `test` 指定的文件使用的 loader。

```js
loaders: [
    {
      	
        loader: 'babel-loader'
    }
]
```

```js
loaders: [
    {
      	test: /\.js|jsx$/,
        loaders: ['babel-loader', 'jsx-loader']
    }
]
```

### query

对上一步的 loader 进行定制，比如对 `babel-loader` 定制。

```js
loaders: [
    {
        test: /\.js|jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      	query: {
            presets: ['react']
        }
    }
]
```

当然对于 `babel-loader` 的定制也可以独立成一个 `.babelrc` 文件进行管理：

```js
//.babelrc
{
  "presets": [
    "react"
  ]
}
```

## plugin

loader 一般是用来加载一些源代码和资源原件，而 plugin 一般是用来扩展 webpack 功能。

比如，我们引入一个在每次打包前都清空编译目录的插件 `clean-webpack-plugin`。

```js
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './index.jsx',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'js/[name].bundle.js'
    },
    plugins: [
        new CleanWebpackPlugin(['build'])
    ],
};
```

## resolve

resolve 可以设置模块如何被解析。

比如我们写了一个 React 组件 `Card.jsx`，引入的时候，一般是 `import Card from './components/Card.jsx` 写 `jsx` 后缀很麻烦，而且 IDE 自动导入的时候经常没有带后缀。

使用 `extensions` 字段可以解决：

```js
module.exports = {
    resolve: {
        extensions: ['.js', '.jsx']
    }
}
```

## 填坑

#### babel-loader 的 preset

使用 `babel-loader` 解析 jsx 文件时，要指定 preset 为 `react`，不然会识别不了 jsx 语法；

#### 模块引入的路径

定义模块后引入模块时，请使用绝对路径。比如创建了一个目录叫 `reducers`，其下有一个 `index.js`，在与`reducers` 同级的文件中引入：

```js
import reducers from 'reducers';
```

打包之后会报错 `Module not found: Error: Can't resolve 'reducers'` 。

这是因为，我们那样子写，webpack 会以为 `reducers` 这个模块位于 `node_modules` 中，结果当然是找不到了。

正确的做法是使用绝对路径：

```js
import reducers from './reducers';
```

位于 `node_modules` 中的模块则理所当然地可以使用第一种方式：

```js
import React from 'react';
```

