---
layout: post
title: Python 从入门到秃顶 - 3
date: 2017-11-30 13:58:05 +0800
categories: [coding, python, way2bald]
permalink: /:categories/:title
index: 14
---

### 高阶函数

高阶函数，High-order Function，指能接受其他函数作为参数的函数。

Python 中函数名相当于变量，指向函数本身。

```python
def foo(content):
  print(content)
  
f = foo
f('reinhardt')		# 'reinhardt'
```

```python
def foo(content):
  print(content)
  
def bar(x, y, f):
  f(x, y)

bar('hi', 'genji', foo)		# 'hi genji'
```

* map

`map` 操作是对 Iterable 的每个元素进行变换，然后返回一个已经变换后的 Iterator：

```python
def trans(x):
  return x * 2

my_list = list(range(11))
my_list_mapped = map(trans, my_list)
print(list(my_list))		# 由于 Iterator 是惰性的，需要使用 list 函数将整个数列计算出来
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

* reduce

`reduce` 操作是对 Iterable 的每个参数进行变换，并且将累积上一个值并返回给下一步操作：

```python
from functools import reduce

def sum_up(x, y):	# x 是前一个返回值，y 是当前值
  return x + y

my_list = list(range(6))
my_list_reduced = reduce(sum_up, my_list)
print(list(my_list_reduced))		#15
```

`reduce` 操作有拍平的效果，即降维的作用。比如上面将一个数组（二维）变换成一个整数（一维），相应地，使用 `reduce` 操作，也能将三维数组变换为二维数组。

* filter

`filter` 操作，顾名思义是用来过滤元素的：

```python
def is_odd(x):
  return x % 2 == 0

my_list = list(range(6))
my_list_filtered = filter(is_odd, my_list)
print(list(my_list_filtered))		# [0, 2, 4]
```

### 返回函数

```python
def sum_up(*args):
  def inner():
    sum = 0
    for n in args:
      sum += n
    return sum
  return inner

f = sumup(1, 2, 3)
f()		# 6
```

### lambda 表达式

lambda 表达式用以声明匿名函数，可以简化代码，但是只能有一个表达式。

```python
my_list = list(range(6))
my_list_filtered = filter(lambda x: x % 2 == 0, my_list)
```

lambda 表达式同样可以作为返回值让函数返回一个参数：

```python
def return_lambda(x, y):
  return lambda: x + y

# 相当于
def return_lambda(x, y):
  def inner():
    return x + y
  return inner

def return_lambda1(x, y):
  return lambda p, q: p + x, q + y

# 相当于
def return_lambda1(x, y):
  def inner(p, q):
    return p + x, q + y
  return inner
```

### 装饰器

在代码运行期间动态增加函数功能的方式，称为装饰器（Decorator）。

每个函数都能使用 `f.__name__` 来获得其名字，我们想要在每个函数调用前打印出该函数的名字，但又不想改动现有的函数内部实现，可以使用装饰器：

```python
# 声明装饰器
def decorator(func):
    print("call", func.__name__)
    return func

@decorator
def foo():
  print('hello')
  
foo()
# call foo
# hello
```

可以看到，在装饰器里面，将被装饰的函数作为参数传入，然后在返回一个 `inner` 函数，`inner` 里面放入自行加入的逻辑（如打印出函数名），然后执行被装饰的函数，并且返回其返回值，最后返回 `inner` 函数。

所以，使用了 `decorator` 装饰的 `foo` 执行时相当于：

```python
decorator(foo)
```

如果装饰器本身需要传入参数，比如 `@decorator(content)`，那么装饰器的声明需要再包裹一层：

```python
def decorator(content):
    def wrapper(func):
        print(content, func.__name__)
        return func
    return wrapper

@decorator('hello')
def foo(x):
  print(x)

foo('hi')
# hello foo
# hi
```


