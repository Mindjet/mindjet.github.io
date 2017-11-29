---
layout: post
title: Python 从入门到秃顶 - 1
date: 2017-11-29 16:11:05 +0800
categories: [coding, python, way2bald]
permalink: /:categories/:title
index: 15
---

> 基于 Python 3.3.4

### 数据类型

* 整数
* 浮点数，可用科学表达法，如 `1.23e10`
* 字符串，使用 `''`或者`""`包裹，使用 `\`转义
* 布尔值，`True` 和 `False`
* 空值，`None`

### 类型转换

```python
int('123')	#123
int('123.2')	#123
float('123.2')	#123.2
str(12.3)	#'12.3'
bool(1)		#True
bool(0)		#False
bool('')	#False
bool(None)	#False
```

### 基本运算

* 加
* 减
* 乘
* 除，分为普通除`/`和地板除`//`，前者即使是整数整除也得到浮点数，后者则向下取整
* 取余
* 布尔操作，`and`，`or` 和 `not`

### 字符串打印

普通打印（逗号在打印时替换为空格）：

```python
print(a, b, c, d)
```

格式化打印（可以用 `%s`，`%d`，`%f`，`%h`进行占位，不知道类型的情况下可以用 `%s`）：

```python
print('hi, my name is %s' % name)
print('hi, we are %s %s' % (name1, name2))
```

### list 和 tuple

list 为可变数组，tuple 为不可变数组

* 声明

```python
my_list = ['hi', 1, True]
my_tuple = ('hi', 1, True)
my_tuple = 'hi', 1, True
my_tuple = ('hi', )		# 只有一个元素时，一定要按照这个格式，以免产生歧义
my_tuple = ()
```

* 索引

使用 **负数** 索引值可以从尾部索引，即 `list[-1]` 表示倒数第一个元素，`list[-2]` 表示倒数第二个元素

* 元素操作

list 可以进行元素操作，tuple 没有这种特性

```python
my_list = ['hi', 1, True]
my_list.append('genji')
my_list.pop(i)		# 删除特定位置元素， 默认-1
```

### range

range 是 `built-in` 函数，用以快速构建特定的的整数序列：

```python
range(stop)
range(start, stop, step)
```

利用 `range`，`list` 和 `tuple` 可以快速构建数组：

```python
my_range = range(11)
my_list = list(my_range)
my_tuple = tuple(my_range)
```

### dict 和 set

dict 相当于其他语言的 map，即储存 key-value 的结构，格式与 json 类似：

```python
my_dict = {
            'name': 'mike',
            'age': 10,
            'hobby': ['football', 'tennis']
        }
my_dict['name']			# mike
my_dict.get('sex', 'male')		# male
'name' in my_dict	# True
```

dict 查找的速度比 list 更快，因其建立起了索引，但同时也牺牲了空间。

set 即无序切不重复的集合，创建需要传入一个 list 或 tuple：

```python
my_list = ['hi', 1, True]
my_set = set(my_list)
my_set.add('genji')
my_set.remove(1)

# 交集
set1 & set2
# 并集
set1 | set2
```

### 默认参数和可变长参数

默认参数可以有效减少函数的重载：

```python
def power(x, n=2):
  return math.pow(x, n)

power(5)	# 25
power(5, 2)	# 25
```

可变长参数，使用 `*` 来标识：

```python
def var_args(*varargs):
    for arg in varargs:
        print(arg)

var_args(1, 2, 'hanzo')
my_tuple = 1, 2, 'hanzo'
var_args(*my_tuple)
```

### 递归和尾递归

我们写一个阶乘函数：

```python
def factorial_1(n):
  if n == 1:
    return 1
  else:
    return n*factorial_1(n-1)

factorial_1(5)	#120

def factorial_2(x, y):
  pass

def factorial_tail(x, y):
  if x == 1:
    return y
  else:
    return factorial_tail(x - 1, x * y)
  
factorial_2(5)	#120
```

由于程序中是以栈的形式来调用函数的（即我们平时说的调用栈）。在普通的递归中，每递归一次就占用一个栈帧，一旦递归调用多次，调用栈就会爆掉（Stack Overflow）。而如果使用尾递归，则程序在运行时可以对其优化，使其多次递归仍只占用一个栈帧。

但是尾递归对代码结构有要求：递归 `return` 返回的结构只能是自身，而不能包含其他。比如我们上面的 `factorial_1` 函数，由于其 `return` 掺入了 `n*`，所以会建立一个新的栈帧来保存当前调用栈的数据；而 `factorial_tail` 函数 `return` 直接返回了自身，则程序可以将其优化为多次调用只占用一个栈帧。

说了这么多，Python 解释器并没有对尾递归做优化（所以我上面撤了那么多干嘛？摔），不过 Kotlin 有（滑稽。



