---
layout: post
title: Python 从入门到秃顶 - 2
date: 2017-11-29 18:11:05 +0800
categories: [coding, python, way2bald]
permalink: /:categories/:title
index: 13
---

### 切片

切片，Slice，听起来就像把吐司切成一片一片的，然后取出其中的几片或者连续的几片。对应到 Python 中，就相当于取出数组中特定的元素。

```python
my_list = list(range(101))
slice0 = my_list[0:10]		#取出前十个0~9
slice1 = my_list[:10]		#同上
slice2 = my_list[0:10:2]	#对前十个，每2个取1一个
slice3 = my_list[-1:]		#取最后一个，100
slice4 = my_list[-2:]		#反向切片，从倒数第2个向后去 99,100
```

字符串也可以像上面那样操作。

```python
string = 'hello'
string[0:2]		#'he'
```

### 迭代

判断是否为可迭代对象：

```python
from collections import Iterable

isinstance(x, Iterable)
```

Python 可以对任何可迭代对象进行迭代，无论有无下标：

```python
data = {
    'name': 'hanzo',
    'age': 38,
    'occupation': 'ninjia',
}

for key in data:
    print(data[key])
    
for value in data.values():
    print(value)
    
for key, value in data.items():
    print(key, value)
```

但是在迭代 list 的过程中，每一次迭代我们只能获得元素的值，而不能获得索引，使用 `enumerate` 函数可以解决：

```python
my_list = ['hi', 1, True]

for value in my_list:
  print(value)
  
for index, value in enumerate(my_list):
  print(index, value)
```

### 列表生成式

列表生成式，List Comprehensions，即快速生成列表的表达式。

```python
[x for x in range(11)]   #[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
[x + x for x in range(11)]	#[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
[x for x in range(11) if x % 2 == 0]	#[0, 2, 4, 6, 8, 10]
[x + y for x in 'ABC' for y in 'XYZ']	#['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
```

### 生成器

生成器，Generator，即在使用过程中不断进行计算的结构，受使用驱动，节省内存。

比如，我们创建一个超长数组，但在实际应用中只会使用到前几个，这样后面的就太占用空间了，我们可以使用生成器，让数组的使用中不断地生长。

* 简单声明

生成器的简单声明方式跟列表生成式类似，把`[]`改为`()`：

```python
generator = (x * x for x in range(11))
```

* 详细声明

为了实现更复杂的逻辑，我们需要使用定义函数的方式来声明生成器，在产生元素的地方使用 `yiedld` 关键字即可（跟线程中的 yield 有点类似，相当于中断当前的动作，等到下次需要的时候再继续进行）：

```python
def fibonacci(max):		# Fibonacci 数列  1, 1, 2, 3, 5, 8, 13, 21, 34, ...
  n, a, b = 0, 0, 1
  while n < max:
    yield b
    a, b = b, a + b
    n = n + 1
  return 'finished'
```

* 使用

可以使用 `next(generator)` 来获取生成器每一次产生的值，但可能会越界，直接使用 for 进行迭代较为合理：

```python
generator = (x * x for x in range(11))
next(generator)		# 0
next(generator)		# 1
next(generator)		# 4
```

```python
generator = (x * x for x in range(11))
for n in generator:
  print(n)
```

像上面的的 `fibonacci` 生成器的返回值直接用 for 遍历无法拿到，需要使用 `next` 来手动越界抛出 `StopIteration` 异常，返回值边包含在该异常中：

```python
g = fibonacci(6)
while True:
  try:
    next(g)
  except StopIteration as e:
    print(e.value)
    break
```

### 迭代器

迭代器，Iterator，可以被 `next` 函数调用并不断返回下一个数值的对象。就像数据流，理论上可以只有源头而没有尽头，而且是惰性的。

注意区分 Iterable 和 Iterator，前者一般是可以用 for 循环进行遍历（数量是确定的），而 Iterator 对象一般是用 `next` 函数来产生下一个数值（数量不确定，并不知道后面还有多少个）。

像 list，tuple，dict 它们都是 Iterable 对象而不是 Iterator，生成器就比较厉害了，它既是 Iterable 又是 Iterator，不仅可以用 for 循环遍历，还可以用 next 来生成下一个数值。

list，tuple，dict 也可以转换成 Iterator：

```python
from collections import Iterable, Iterator

my_list = ['hi', 1, True]
isinstance(my_list, Iterable)	#True
isinstance(my_list, Iterator)	#False

my_list_iter = iter(my_list)
isinstance(my_list_iter, Iterable)	#True
isinstance(my_list_iter, Iterator)	#True
```

