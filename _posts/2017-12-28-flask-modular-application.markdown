---
layout: post
title: Flask 多模块开发
date: 2017-12-28 16:25:05 +0800
categories: [coding, python, flask]
permalink: /:categories/:title
index: 5
---

在开发一个 web 项目时，经常需要将业务切分不同的几个模块来开发。比如开发一个电商系统，那么简单的需要商品模块、购物车模块和用户模块。在 Flask 中我们使用 `app.router(url)` 的方式来相应端点请求，如果将所有模块的请求全部糅合在 `app.py` 中，那么项目将变得非常冗杂、高耦合而且难以多人维护。

学习 Flask 的多模块开发对于切分业务非常重要。

在 Flask 中，多模块的开发主要依赖于 `Blueprint`。

### 单模块

在介绍 `Blueprint` 之前，先来看看传统的单模块开发是怎么做的吧。

还是以电商为例，在 `app.py` 我们需要实现商品、购物车和用户模块的路由：

```python
# app.py
from flask import Flask

app = Flask(__name__)

@app.router('/api/goods')
def getGoods():
  	pass

@app.router('/api/cart')
def getCart():
  	pass

@app.router('/api/user')
def getUserInfo():
  	pass
```

虽然，上面可以实现功能，但是实际情况每个模块肯定有很多个端点请求，`app.py` 将变得庞大而且不利于多人同时开发。

当然，如果你的 web 应用简单到只提供几个端点请求，那么你确实可以直接把它们都放到 `app.py` 里面。

### Blueprint

**蓝图的基本设想是当它们注册到应用上时，它们记录将会被执行的操作。 当分派请求和生成从一个端点到另一个的 URL 时，Flask 会关联蓝图中的视图函数。**

蓝图的工作方式跟 Flask 应用对象很相似，但它本身不是一个应用。

继续使用上面的例子，将路由切分为 3 个模块：

```
good.py
cart.py
user.py
```

以商品模块为例：

```python
# good.py
from flask import Blueprint

good_blueprint = Blueprint(
	'good',
  	__name__,
  	url_prefix='/api/good'
)

@good_blueprint.router('/')
def getGoods():
  	pass

@good_blueprint.router('/<catagory_id>')
def getGoodsInCatagory():
  	pass
```

可以看到，Blueprint 对象的使用跟 Flask 应用对象一致，而且在声明时还可以指定 url 前缀，如上面的 `/api/good`。

之后，要使这些路由生效，Flask 应用应注册这些 Blueprint：

```python
from good import good_blueprint

app = Flask(__name__)

app.register_blueprint(good_blueprint)
```

当然我推荐使用以下的项目结构统一管理路由：

```
Project
  ┣ router
  ┃ ┣ good.py
  ┃ ┣ cart.py
  ┃ ┣ user.py
  ┃ ┗ __init__.py
```

```python
# router/__init__.py
from good import good_blueprint
from cart import cart_blueprint
from user import user_blueprint

blueprint = [
  good_blueprint, 
  cart_blueprint, 
  user_blueprint
]
```

然后在 `app.py` 引入 `router.blueprint` 遍历注册即可。

### 题外话

最后介绍一下 `flask_script` 这个模块在 Flask web 程序中的应用。

`flask_script` 的 `Manage`使得在运行 py 文件的时候可以指定参数，并根据不同参数来做不同的事情：

```python
# manage.py
from flask_script import Manage, Server
from app import app as flask_app

manage = Manage(flask_app)
manage.add_command('runserver', Server(host='127.0.0.1', port=5000, use_debugger=True))

if __name__ == '__main__':
  	manage.run()
```

然后运行：

```bash
python manage.py runserver
```

就可以让应用跑起来了。

那么，单模块的开发模式将所有模块都放进了 `app.py`，`app.py` 庞大而且不利于多人同时开发。
