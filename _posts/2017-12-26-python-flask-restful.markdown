---
layout: post
title: Flask 开发 RESTful 接口
date: 2017-12-26 19:16:05 +0800
categories: [coding, python, flask]
permalink: /:categories/:title
index: 13
---

简单学了一下 Flask，没有接触 template 和 Jinja2 的知识，目的就是想利用 python 单纯写后台接口，实现前后端分离。也据说 python 项目写界面很蛋疼，所以索性放弃了，后面再尝试捣鼓一下 Node + Express （逃

## 数据结构

### 实体

简单地，我们以歌曲为实体，定义存在数据库中的数据有 4 个字段：

```groovy
id
title
artist
rating
```

### 统一接口

规定接口的数据返回格式为：

```json
//成功
{
    "response": ...,
    "status": 1,
    "message": "success"
}

//失败
{
    "response": ...,
    "status": 0,
    "message": error_msg
}
```

## SQLite3

简单地，使用 SQLite3 作为我们的数据库，轻量快捷，很适合写演示项目。（后期搞大型或者正式项目还是得考虑用一下其他一些成熟的大型框架吧，SQLite 性能估计跟不上）

### SQLite 环境

如果你环境中没有 SQLite，请先[下载](https://www.sqlite.org/)。如果你是一个 Android 开发者，那么恭喜你，在你的 Android SDK 中已经含有 SQLite。

### 创建数据库

在项目目录下新建数据库：

```bash
touch songs.db
```

可以进入 SQLite 环境对该数据库执行 SQL 语句：

```bash
sqlite3 songs.db
sqlite> sql command....
```

### 初始化数据库

我的 Python 版本是 3.6.3，已经自带 `sqlite3` 这个包。

我们新建一个文件 `models.py` 并且在文件中添加删除表格和新增表格的方法，这里我们约定表格名为 `songs`：

```python
import sqlite3


def drop_table():
    with sqlite3.connect('songs.db') as conn:
        cursor = conn.cursor()
        cursor.execute(‘DROP TABLE IF EXISTS songs;’)
    return True


def create_db():
    with sqlite3.connect('songs.db') as conn:
        cursor = conn.cursor()
        sql = """CREATE TABLE songs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            rating INTEGER NOT NULL
        );
        """
        cursor.execute(sql)
    return True


if __name__ == '__main__':
    drop_table()
    create_db()
```

我们直接执行这个模块，就可以将存在的 `songs` 表格删除掉，并创建一个全新的 `songs` 表格。

对于其中 `with` 语句比较陌生或者不懂的读者，建议先看看之前写的几篇 Python 扫盲文，认准 [Python从入门到秃顶系列](https://mindjet.github.io/coding/)，补充一下 Python 的基础知识。

好了，到目前为止，我们已经创建了一个数据库 song.db，在数据库中新建了一个表格 songs，表格一共有 4 列，分别为` id、title、artist 和 rating`。

## app 层

在 app 层，我们主要编写网络请求的端点（endpoint），来实现不同的请求方法和请求路径返回不同的数据。这部分代码位于 `app.py` 模块中。

我们知道用 Flask 写一个网络接口很简单：

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/song')
def collection():
    return jsonify('hello')
  

if __name__ == '__main__':
  	app.run(debug=True)
```

这样，我们运行 `app.py` 模块之后，访问 `http://localhost:5000/api/song`就可以看到 `hello` 了。

所以，我们可以根据端点的不同，请求方法的不同来处理不同的请求。

我们这里提供五种请求：

```bash
/api/song				GET, POST
/api/song/<song_id>		GET, PUT, DELETE
```

请求的方法可以通过 `request.method` 获得，请求的 body 可以通过 `request.form` 获得：

```python
from flask import Flask, request


app = Flask(__name__)


@app.route('/api/song', methods=['GET', 'POST'])
def collection():
    method = request.method
    if method == 'GET':
        pass
    elif method == 'POST':
        pass


@app.route('/api/song/<song_id>', methods=['GET', 'PUT', 'DELETE'])
def resource(song_id):
    method = request.method
    data = request.form
    if method == 'GET':
        pass
    elif method == 'DELETE':
        pass
    elif method == 'PUT':
        pass


if __name__ == '__main__':
    app.run(debug=True)
```

## dao 层

接下来，我们需要编写一个 dao 层，操作数据库，并把相应的接口暴露给 app 层。

举个查询表格中所有歌曲的例子：

```python
import sqlite3
import json

def get_songs():
  	with sqlite3.connect('songs.db') as conn:
      	try:
            cursor = conn.cursor()
            sql_get = 'SELECT * FROM songs ORDER BY id desc'
            cursor.execute(sql_get)
            output = cursor.fetchall()
        except Exception as e:
          	output = 'error'
    return json.dumps(output)
```

SQL 语句这里就不多讲了，不懂的读者到网上都可以找到基础教程。

注意，如果要用 json 格式传输的话，记得 return 之前要把结果转成 json 格式，以下两种方式都可以：

```python
import json
from Flask import jsonify

json.dumps(output)
jsonify(output)
```

然后在 app 层调用 `get_songs` 函数，就可以查询到表格中的所有歌曲了：

```python
import dao

@app.route('/api/song', methods=['GET', 'POST'])
def collection():
    method = request.method
    if method == 'GET':
        dao.get_songs()
    elif method == 'POST':
        pass
```

还记得在第一部分我们说到的**统一接口结构**吗？

```json
//成功
{
    "response": ...,
    "status": 1,
    "message": "success"
}

//失败
{
    "response": ...,
    "status": 0,
    "message": error_msg
}
```

我们继续使用 `get_songs` 这个例子来实现，实现之前我们要先完成 2 个任务。

**结构转换**

我们使用 `cursor.fetchall()` 获得的数据结构是 List[tuple]：

```python
[(id0, title0, artist0, rating0), (id1, title1, artist1, rating1), ...]
```

我们想要的是：

```json
[
  {
    "id": 0,
    "title": title0,
    "artist": artist0,
    "rating": rating0
  },  
  {
    "id": 1,
    "title": title1,
    "artist": artist1,
    "rating": rating1
  },
  ...
]
```

这个我们可以写一个映射函数来实现：

```python
def mapping(x):
  return [lambda y: {'id':y[0], 'title': y[1],'artist': y[2], 'rating': y[3]} for y in x]

# 对于单个tuple，我们简单地使用
def mapping(x):
  return {'id':x[0], 'title': x[1],'artist': x[2], 'rating': x[3]}
```

**统一结构**

这个我们根据成功与否直接构建即可，这里封装成一个方法：

```python
def get_songs():
  	with sqlite3.connect('songs.db') as conn:
      	try:
            cursor = conn.cursor()
            sql_get = 'SELECT * FROM songs ORDER BY id desc'
            cursor.execute(sql_get)
            result = cursor.fetchall()
            output = __common_struct(result)
        except Exception as e:
          	output = __common_struct(None, False)
    return output

  
def __common_struct(data, success=True, msg='error'):
  	if success:
      	output =  {'response': data, 'status': 1, 'message': 'success'}
    else:
      	output =  {'response': data, 'status': 0, 'message': msg}
    return json.dumps(output)
```

到目前为止，我们已经可以通过 GET 方式访问 `http://localhost:5000/api/song` 来获取数据库中的所有歌曲信息了，并且是以约定好的数据结构返回。

```json
// http://localhost:5000/api/song GET
{
    "response": [
        {
            "id": 2,
            "title": "symphony",
            "artist": "beethoven",
            "rating": 5
        },
        {
            "id": 1,
            "title": "summer",
            "artist": "hisaishi",
            "rating": 5
        }
    ],
    "status": 1,
    "message": "success"
}
```

接下来，我们要写添加歌曲、查询特定id歌曲、删除特定id歌曲和更新特定id歌曲的函数。

到这里我就不想写了，为什么？你没发现，每写一个端点函数，就要写一堆重复的代码吗？

就像下面这样：

1. 要先连接数据库
2. 获取 cursor
3. 捕获异常
4. 根据映射规则转换成约定的数据结构

```python
with sqlite3.connect('songs.db') as conn:
  	try:
      	cursor = conn.cursor()
        
	except Exception as e:
```

上面这部分包括 `__common_struct` 都是重复的十分枯燥的代码，还要写 4 个这种函数，而且后期还看增加更多端点，要写你自己写我才不写。

？？？就这么完了吗 ？？？

## 装饰器救场

当然不是，我们想要的是，我们在 dao 中的各个函数只关注增删改查，而连接数据库、异常处理和格式化的操作交由其他地方来做。

Python 中的装饰器设计简直就是咱们现在这个境况的救星。

废话不多说，直接上代码：

```python
# decorator.py
import json
import sqlite3


def db_helper(db_name, jsonfy_rule):
    def wrapper(func):
        def inner(*args, **kwargs):
            with sqlite3.connect(db_name) as conn:
                try:
                    result = func(conn=conn, *args, **kwargs)
                    response = __common_struct(jsonfy_rule(result))
                except Exception as e:
                    response = __common_struct(None, False, str(e))
            return response
        return inner
    return wrapper


def __common_struct(data, success=True, error_msg='error'):
    if success:
        result = {'response': data, 'status': 1, 'message': 'success'}
    else:
        result = {'response': data, 'status': 0, 'message': error_msg}
    return json.dumps(result)
```

1. 在 `db_helper` 这个装饰器中，传入了 `db_name` 和 `jsonfy_rule`，对应数据库名字和映射规则
2. 然后我们开启了数据库连接，并且把 conn 传给了被装饰的函数
3. 我们在装饰器中 handle 异常情况并且将函数的返回值封装成统一的数据结构

对应的我们的 `dao.py` 需要修改：

```python
# dao.py
@db_helper('songs.db', lambda x: [mapping(y) for y in x])
def get_songs(conn=None):
    cursor = conn.cursor()
    sql_get = 'SELECT * FROM ' + constant.TABLE_NAME + ' ORDER BY id desc'
    cursor.execute(sql_get)
    output = cursor.fetchall()
    return output
```

注意：

1. 要添加 `conn=True`，将 `conn` 作为参数传入并且默认值为 `None`，这是因为装饰器会给该函数传 conn，而在 `app.py` 中咱们调这个函数是没法给他提供 conn 的，所以要给个默认值 None
2. 装饰器第二个参数是传入映射规则，规定了如何将从**数据库直接获取的数据结构**转换成**最后进行 Json 格式化的数据结构**

现在整个代码是不是简洁了很多？而且没有蜜汁缩进了。

以下是 `dao.py` 完整代码：

```python
import constant
from decorator import db_helper
from exception import NotFoundException


def mapping(x):
    if x is None:
        return None
    return {'id': x[0], 'title': x[1], 'artist': x[2], 'rating': x[3]}


@db_helper('songs.db', mapping)
def add_song(data, conn=None):
    cursor = conn.cursor()
    sql_insert = 'INSERT INTO ' + constant.TABLE_NAME + ' (title, artist, rating) values (?, ?, ?)'
    cursor.execute(sql_insert, (data['title'], data['artist'], data['rating'],))
    return None


@db_helper('songs.db', lambda x: [mapping(y) for y in x])
def get_songs(conn=None):
    cursor = conn.cursor()
    sql_get = 'SELECT * FROM ' + constant.TABLE_NAME + ' ORDER BY id desc'
    cursor.execute(sql_get)
    output = cursor.fetchall()
    return output


@db_helper('songs.db', mapping)
def get_song(song_id, conn=None):
    cursor = conn.cursor()
    check_existence(cursor, song_id)
    sql_get = 'SELECT * FROM ' + constant.TABLE_NAME + ' WHERE id = ?'
    cursor.execute(sql_get, (song_id,))
    song = cursor.fetchone()
    return song


@db_helper('songs.db', mapping)
def delete_song(song_id, conn=None):
    cursor = conn.cursor()
    check_existence(cursor, song_id)
    sql_delete = 'DELETE FROM ' + constant.TABLE_NAME + ' WHERE id = ?'
    cursor.execute(sql_delete, (song_id,))
    return None


@db_helper('songs.db', mapping)
def update_song(song_id, data, conn=None):
    cursor = conn.cursor()
    check_existence(cursor, song_id)
    sql_update = 'UPDATE ' + constant.TABLE_NAME + ' SET title = ?, artist = ?, rating = ? WHERE id = ?'
    cursor.execute(sql_update, (data['title'], data['artist'], data['rating'], song_id,))
    return None


def check_existence(cursor, song_id):
    sql_check = 'SELECT * FROM ' + constant.TABLE_NAME + ' WHERE id = ' + song_id
    cursor.execute(sql_check)
    result = cursor.fetchall()
    if len(result) == 0:
        raise NotFoundException('song not exist')
```

