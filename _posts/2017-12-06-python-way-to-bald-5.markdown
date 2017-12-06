---
layout: post
title: Python从入门到秃顶 - 5
date: 2017-12-06 15:17:05 +0800
categories: [coding, python, way2bald]
permalink: /:categories/:title
index: 6
---

### \_\_slots__

我们知道可以动态地为某个实例甚至类添加属性：

```python
class Genji(object):
  pass

genji = Genji()
genji.skin = 'Beduin'
Genji.weapons = 'dart', 'dagger', 'sword'
```

使用 `__slots__` 可以为类限制属性：

```python
class Genji(object):
  __slots__ = 'skin', 'weapons'
  
genji = Genji()
genji.skin = 'Beduin'	# ok
genji.height = '170'	# AttributeError
```

`__slots__` 可以限制实例只能使用哪些属性。

`__slots__` 如果没有明确声明，不具有可继承性。即如果在父类中声明了 `__slots__` 而在子类中没有声明，那么子类的属性不受限制；如果子类也声明了，那么子类的 `__slots__` 相当于两者的叠加。

```python
class Hero(object):
  __slots__ = 'name'

class Genji(Hero):
  pass

class Hanzo(Hero):
  __slots__ = 'weapons'

genji = Genji()
genji.skin = 'Beduin'	# ok

hanzo = Hanzo()
hanzo.weapons = 'arrow', 'bow'
hanzo.skin = 'wolf'		# AttributeError
```

### @property

在开发中我们经常会直接将属性名暴露，比如 `hero.name`，使用虽然方便，但是我们无法去做类型检查。

有一种解决方案是，将属性隐藏并且自己定义 `getter/setter`，但是略显繁琐：

```python
class Hero(object):

    def __init__(self):
        self._name = 'hero'

    def get_name(self):
        return self._name

    def set_name(self, name):
        if isinstance(name, str):
            self._name = name
        else:
            raise TypeError("str is required.")
            
hero = Hero()
hero.get_name()
hero.set_name('genji')
```

使用 `@property` 可以简化上面的流程：

```python
class Hero(object):

    def __init__(self):
        self._name = 'hero'

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        if isinstance(name, str):
            self._name = str
        else:
            raise TypeError('str is required.')
            
hero = Hero()
hero.name = 'genji'
```

### 多重继承 MixIn

Python 支持多重继承，这可屌爆了。

比如我们定义两个类：英雄（Hero）和岛田家族（Shimada）

```python
class Hero(object):
    def ultimate(self):
        print('ultimate launched!')


class Shimada(object):
    def climb(self):
        print('I can climb wall')
```

英雄有大招（ultimate），而岛田家的人能爬墙（climb）。

源氏（Genji）既是英雄，也是岛田家族的人：

```python
class Genji(Hero, Shimada):
    pass
  
genji = Genji()
genji.ultimate()
genji.climb()
```

如果两个类中存在相同的方法，那么取**排在前面**的父类中的对应方法。

### 定制类

Python class 里面有一些可供定制函数，这里稍微列举一两个：

#### \_\_str__

覆写 `__str__` 方法，可以定制对象被直接打印时的字符串：

```python
class Genji(object):
  	def __str__(self):
      	return 'this is genji shimada!'

genji = Genji()
print(genji)	# 'this is genji shimada!'
```

#### \_\_len__

覆写 `__len__` 方法，可以定制对象被 `len` 作用时的返回值：

```python
class Genji(object):
  	def __len__(self):
      	return 0
    
genji = Genji()
print(len(genji))		# 0
```

还有 `__iter__`，`getitem`，`__getattr__` 方法，这里不一一赘述。

### type

`type()` 函数可以用来判断对象的类型，类的 type 是 `type`，实例的 type 是其类：

```python
class Hero(object):
    pass
	
hero = Hero()
print(type(Hero))	# <class 'type'>
print(type(hero))	# <class '__main__.Hero'>
```

type 不仅可以用来判断类型，而且可以用来动态创建类：

```python
def func(self):
    print('I am hero.')
    
Hero = type('Hero', (object,), dict(info=func))
hero = Hero()
hero.info()		# 'I am hero.'
```

使用 `type` 动态创建类，所传入的参数为：

1. 类名
2. 继承类集合，以 tuple 的格式输入，注意只有单个元素时的特殊写法
3. 类方法集合，以 dict 的格式输入，传入的方法第一个参数需为 `self`

通过 `type` 动态创建类和我们平时声明 class 去创建类并无差异，而且，Python 解释器在解析 class 之后，正是使用了 `type` 函数来创建类。

