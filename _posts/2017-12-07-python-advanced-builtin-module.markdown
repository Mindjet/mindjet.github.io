---
layout: post
title: Python进阶-常用內建模块
date: 2017-12-07 15:21:05 +0800
categories: [coding, python, advanced]
permalink: /:categories/:title
index: 11
---

### datetime

**引入**：

```python
from datetime import datetime
```

**获取当前时间，与时间戳互转**

```python
from datetime import datetime

dt = datetime.now()
ts = datetime.timestamp(dt)
dt_from_timestamp = datetime.fromtimestamp(ts)
print(dt)
print(ts)
print(dt_from_timestamp)

# 2017-12-07 10:04:28.314380
# 1512612268.31438
# 2017-12-07 10:04:28.314380
```

时间戳是基于 `1970年1月1日 00:00:00 UTC+00:00` 这个时间，称为 `epoch time`，之前的时间为负数。

Python 的 timestamp 是浮点数，小数部分是毫秒数，这个与 Java 不同，后者是直接将毫秒数也当为整数，所以两者的转换关系是 `python's timestamp = java's timestamp / 1000`。

**与 str 互转**

两种转换都需要制定格式：

```python
dt_from_str = datetime.strptime('2013-09-20 20:00:00', '%Y-%m-%d %H:%M:%S')
str_from_dt = datetime.strftime(dt_from_str, '%a %b %d %Y-%m')
print(dt_from_str)
print(str_from_dt)
# 2013-09-20 20:00:00
# Fri Sep 20 2013-09
```

占位符对应关系：%Y 年、%m 月、%d 日、%b 月英文缩写、%a 礼拜英文缩写、%H 小时、%M 分钟、%S 秒。

### collections

**引入**

```python
import collections
```

**namedtuple**

`namedtuple` 可以创建一个包含更多信息的 tuple。比如我们要创建一个二维平面的点，可以使用 tuple 这种数据结构 `(x, y)`，但是并不能直观地看出这是表示一个点。创建类是一种方法，但是太繁琐，使用 `namedtuple` 可以简化：

```python
Point = collections.namedtuple('Point', ['x', 'y'])
point = Point(1, 2)
print(point.x, point.y)
```

而且，新建出来的“类”其实是 tuple 的子类。

**deque**

使用 list 存储数据，如果按照索引来访问元素，速度很快，但是由于采用了线性存储的方式，一旦 list 的规模达到一定程度，插入和删除元素性能会很低。

`deque` 为了高效实现插入和删除操作的双向列表：

```python
queue = collections.deque(['element' + str(x) for x in range(6)])
print(queue)
queue.pop()
queue.popleft()
queue.append('element_append')
queue.appendleft('element_append_left')
print(queue)

# deque(['element0', 'element1', 'element2', 'element3', 'element4', 'element5'])
# deque(['element_append_left', 'element1', 'element2', 'element3', 'element4', 'element_append'])
```

`deque` 不继承于 list，而是直接继承 object。

**defaultdict**

使用 dict 时，如果我们访问的 key 不存在，会抛出 `KeyError`，为了解决这个问题，我们使用 `defaultdict` 可以让访问不存在的 key 是返回我们定义的值：

```python
dd = collections.defaultdict(lambda: 'NULL')
dd['key0'] = 'value0'
print(dd['key0'])
print(dd['key1'])

# value0
# NULL
```

**OrderedDict**

dict 的 key 是无序的，`OrderedDict` 则是有序的，其他的也不废话了。

### hashlib

`hashlib` 提供了常见的摘要算法（又称哈希算法、散列算法），如 MD5，SHA1 等。

摘要算法是将一份任意长度的数据转换成固定长度的字符串，通常是 16 进制的字符串的格式，摘要算法有如下特点：

* 内容的一丝改动都会导致摘要不同
* 摘要算法是单向的，即从内容获得摘要很容易，但从摘要推算回内容几乎是不可能的

**引入**

```python
import hashlib
```

**MD5**

```python
content = 'Hello, this is a hashlib demo.'
md5 = hashlib.md5()
md5.update(content.encode('utf-8'))
print(md5.hexdigest())
#f0ac48f8d66c57b7b0c4bf1486f64936
```

注意在进行 hash 算法之前要对数据进行编码。

如果内容过长，也可以分多次计算，但结果是一样的：

```python
content1 = 'Hello, this is a hashlib demo.'
content2 = 'Hello, this is another paragraph'
md5 = hashlib.md5()
md5.update(content1.encode('utf-8'))
md5.update(content2.encode('utf-8'))
print(md5.hexdigest())
#cb5afb89e067e2b457442dc1f3907753
```

MD5 计算出来的 hash 码用 32 位的 16 进制字符串表示。

**SHA1**

使用方法与 MD5 类似，不再赘述，不同的是用 40 位的 16 进制字符串表示。

### itertools

`itertools` 模块提供了不错的迭代器函数和操作符。

**引入**

```python
import itertools
```

**无限迭代器**

`count` 可以产生无限的整数数据流：

```python
naturals = itertools.count(0)
for n in naturals:
    print(n)
```

`cycle` 可以重复一个字符串，产生无限字符数据流：

```python
charStream = itertools.cycle('abc')
```

`repeat` 可以重复一个对象，产生无限对象数据流，但是第二个参数可以指定重复次数：

```python
repeatStream = itertools.repeat(1)
```

**操作符**

`takewhile` 可以获取无限迭代器中满足条件的部分形成新的迭代器：

```python
naturals = itertools.count(0)
lessThanTen = itertools.takewhile(lambda x: x < 10, naturals)
```

`chain` 可以将一个或一个以上的迭代器连接起来：

```python
chained = itertools.chain([x for x in range(11)], [x for x in range(6)])
```

### contextlib

我们在[上一篇博文（Python进阶-IO）](https://mindjet.github.io/coding/python/advanced/python-advanced-io)中讲到开启文件流用完之后关闭可以用 `with` 语句，那它的原理是什么呢？其实它跟上下文（context）管理有关，实现上下文管理是使用 `__enter__` 和 `__exit__` 这两个方法实现的。

我们定义源氏（Genji）这个类，实现 `__enter__` 和 `__exit__`，同时定义了一些源氏的操作：

```python
class Genji(object):

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print('身可死，武士之名不可欺！')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print('Error')
        else:
            print('该死！')

    def shift(self):
        print('影')

    def ultimate(self):
        print('竜神の剣を喰らえ！')


def selectGenji(name):
    return Genji(name)
```

通过上面的定义之后，我们可以使用 `with` 的格式来操作 Genji 了：

```python
with selectGenji('shadowburn') as genji:
    genji.shift()
    genji.ultimate()
    genji.shift()
    
# 身可死，武士之名不可欺！
# 影
# 竜神の剣を喰らえ！
# 影
# 该死！
```

可以看到，影烧选择了源氏作为英雄 `selectGenji`，然后这时候会出现“身可死，武士之名不可欺”`__enter__`的语音，然后操作源氏影 `shift`，开大 `ultimate` 再影 `shift`，最后死了，出现“该死！”的语音 `__exit__`。

但是每次都得这么写好累啊，还好 Python 提供了 `contextlib` 来简化这些流程。

**@contextmanager**

我们使用 `@contextmanager` 这个装饰器修改上面的例子，可以简化如下：

```python
import contextlib

class Genji(object):

    def __init__(self, name):
        self.name = name

    def shift(self):
        print('影')

    def ultimate(self):
        print('竜神の剣を喰らえ')


@contextlib.contextmanager
def selectGenji(name):
    print('身可死，武士之名不可欺！')
    gj = Genji(name)
    yield gj
    print('该死！')
```

可见，整个结果整洁了不少。`yield` 语句是点睛之笔，它相当于将执行权暂时交给了 `with` 下的所有语句，待这些语句执行完了，再执行 `yield` 下的语句。

`@contextmanger` 可以随意地在其他语句执行之前或之后插入特定的语句：

```python
@contextmanager
def playOverwatch(username):
  	checkUserExistance(username)
    loginOverwatch(username)
    yield
    logoutOverwatch(username)
    
with playOverwatch('mindjet'):
  	openLootbox()
    travalToNumbani()
    talkShitInOpenChannel()
```

就像上面，我们执行了 `playOverwatch` 我要玩守望先锋，然后玩之前就会检查用户是否存在 `checkUserExistance`，登陆账户 `loginOverwatch`，随后你就可以开补给箱 `openLootbox`，去努巴尼游玩 `travalToNumbani` 或者在公频撕逼 `talkShitInOpenChannel`，玩完了就退出守望先锋 `logoutOverwatch`。
