---
layout: post
title: webpack 开发/生产环境配置
date: 2017-12-13 17:42:05 +0800
categories: [coding, frontend, webpack]
permalink: /:categories/:title
index: 11
---

## Easy approach

对于前端工程，使用 webpack 打包一般是读取工程下的 `webpack.config.js` 配置。对于开发环境（development）和生产环境（production）我们常常需要使用不同的配置。

最简单的解决方案是创建一个 `webpack.config.dev.js` 作为开发环境的配置文件，`webpack.config.js` 则作为生产环境的配置文件。

然后，在 `package.json` 中指定打包时使用不同的命令：

```js
"scripts": {
  "dev": "webpack --config webpack.config.dev.js",	//开发环境
  "prod": "webpack --config webpack.config.js"	//生产环境，不指定也行，默认使用webpack.config.js
},
```

使用 `npm run dev` 或者 `npm run prod` 就可以为两种不同的环境打包了。

但其实生产环境和开发环境的大部分配置还是相同的，相当于我们需要写很多一模一样的配置代码，这一点也不 Geek。

## Elegant approach

这里提出一种比较优雅的解决方案，即在 `webpack.config.js` 中判断环境进行配置。

如何在 `webpack.config.js` 中判断当前是开发环境的打包还是生产环境的打包？我们可以通过环境变量实现。

比如，我们定义一个环境变量叫 `WEBPACK_ENV`，可以有 `dev` 或 `prod` 两个值。

在 *nix 环境下，这么定义：

```shell
export WEBPACK_ENV=dev
export WEBPACK_ENV=prod
```

在 Windows 下，这么定义：

```shell
set WEBPACK_ENV=dev
set WEBPACK_ENV=prod
```

配合打包命令，在 *nix 环境下，可以写成：

```js
"scripts": {
  "dev": "export WEBPACK_ENV=dev&&webpack",	//开发环境
  "prod": "export WEBPACK_ENV=prod&&webpack"	//生产环境
},
```

在 Windows 下则是：

```js
"scripts": {
  "dev": "set WEBPACK_ENV=dev&&webpack",	//开发环境
  "prod": "set WEBPACK_ENV=prod&&webpac"	//生产环境
},
```

然后，我们就可以在 `webpack.config.js` 来获得该变量的值了（Node 的功能）：

```js
const env = process.env.WEBPACK_ENV;
if (env === 'prod') {
    //生产环境配置
} else {
    //开发环境配置
}
```

可能你对如何修改配置比较好奇，这里也稍微提一下：

```js
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const config = {
    entry: {
        index: './app/index.js',
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'js/[name].bundle.js',
    },
    module: {},
    plugins: []
};

const env = process.env.WEBPACK_ENV;
if (env === 'prod') {
    config.plugins.push(new UglifyJsPlugin({minimize: true}));
    config.output.filename = 'js/[name].bundle.min.js';
}

module.exports = config;
```

上面是一个简单的配置文件。

在生产环境下，我们新增了一个 `UglifyJsPlugin` 插件来格式化最终打包的 js 代码，并且将该 js 文件命名为 `[name].bundle.min.js`；开发环境下，则使用默认配置，不格式化 js 文件，直接输出 `[name].bundle.js`。

最后切记，一定要把配置 exports 出去，不然 webpack 打包时会读取不到配置。
