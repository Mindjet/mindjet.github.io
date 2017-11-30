---
layout: post
title: Python 从入门到秃顶 - 4
date: 2017-11-30 16:13:05 +0800
categories: [coding, python, way2bald]
permalink: /:categories/:title
index: 16
---

## 模块和包

在 Python 中，每一个 .py 文件都是一个**模块**，其文件名就是模块名。为了解决多个同名模块之间的冲突，引入了**包**。

包其实是一个文件夹，但是文件夹下存在一个 `__init__.py`，该文件的模块名便是这个包的包名。如果文件夹下不存在 `__init__.py`， 那么该文件夹便只是一个普通目录。

比如我们有如下的工程目录：

```
company_domain
  ┣ utils
  ┃ ┣ __init__.py
  ┃ ┣ dump.py
  ┃ ┗ foo.py
  ┣ __init__.py
  ┗ baz.py
```

那么 `foo.py` 的模块名便是 `company_domain.utils.foo`。

但注意，虽然使用包可以避免与其他模块的冲突，但是逃不过系统自带的模块，所以自己创建模块时，**要确保不能与 Python 自带的模块名冲突。**

### 作用域

理论上，Python 模块里面的变量和函数都是 `public`的，但是我们为了保证区分内部使用和外部公开，一般会作如下约定：

* 形如 `abc`, `ABC` 的变量和方法是公开的
* 形如 `__abc`, `_abc` 的变量和方法是私有的
* 形如 `__abc__` 的变量是特殊变量，可以公开，但是有特殊用途，一般是只读的，比如 `__name__`

## 类和实例

Python 中类和实例的概念和用法与 Java 等语言相似。类是抽象的模板，而实例是具象的个体。

```python
class Myclass(object):
  pass

my_class = Myclass()
```

可以自由地为实例添加属性：

```python
my_class = Myclass()
my_class.name = 'my class'
```

类可以有构造方法和类属性（但不要和实例属性重名）：

```python
class Myclass(object):
  level = 0
  
  def __init__(self, name):
    self.name = name
```

类中的每一个方法，第一个参数一定是 `self`，表示自身。

### 作用域

类不同于模块，类在“一定程度”上可以设置私有变量，即形如 `__abc` 的变量：

```python
class Myclass(object):
  
  def __init__(self, name):
    self.__name = name
    
my_class = Myclass()
my_class.__name		# AttributeError
```

我们说的是一定程度上可以限制外部访问私有变量，就是说还存在一些门路可以访问到。比如上面的例子，Python 解释器其实会把 `__name` 变量编译成 `_Myclass__name`，这样就可以通过 `my_class._Myclass__name` 来访问到私有变量了。但是这种做法并不保险，因为 Python 解释器不一定是编译成 `_Myclass__name`。所以一旦我们约定好了，就不要去强行打破这种规范。

## 继承和多态

### 继承

继承即子类拥有父类的变量和方法。

```python
class Hero(object):
    def __init__(self, name):
        self.name = name

    def ultimate(self):
        print('Ultimate!')

        
class Genji(Hero):
    def info(self):
        print(self.name)

  
genji = Genji('genji')
genji.ultimate()		# 'Ultimate!'
genji.info()		# 'genji'
```

我们上面举了守望先锋的例子，作为英雄（Hero），有**名字（name）**这个属性，也有**大招（ultimate）**这个方法。源氏（Genji）是一名英雄，所以他自然而然地就拥有了**名字**这个属性和**大招**这个方法。

### 多态

多态，通俗点讲，就是继承于同个父类的不同子类，可以有不同的表达方式，我们还是以守望先锋来举例：

```python
class Hero(object):
    def ultimate(self):
        print('Ultimate!')

class Genji(Hero):
    def ultimate(self):
        print('竜神の剣を喰らえ')
        
class Hanzo(Hero):
    def ultimate(self):
        print('竜が我が敌を喰らう')

def ultimate_release(hero):
  	hero.ultimate()

ultimate_release(Genji())		# '竜神の剣を喰らえ'
ultimate_release(Hanzo())		# '竜が我が敌を喰らう'
```

上面我们定义了两个英雄，源氏（Genji）和半藏（Hanzo），他们都是英雄（Hero），所以他们都有大招技能（ultimate），但他们大招不一样，当他们各自施放大招的时候，源氏喊出来的是`竜神の剣を喰らえ`，而半藏的是 `竜が我が敌を喰らう`。一个是龙刃，而一个是巨龙之魂。

这便是多态的体现。

不过 Python 和其他的动态语言都有一个特点，像上面的 `ultimate_release` 方法并不严格检查 `hero` 的类型，只要接下来的 `hero.ultimate` 操作能成功执行，即传入的对象有 `ultimate` 方法，那么程序就不会出错。

就比如此时乱入了一个路飞，人家也有大招呀，虽然他不是守望先锋里面的英雄，他也能成功施放大招：

```python
class Luffy(object):
  	ultimate(self):
      	print('gomugomuno')		# 好吧，橡胶手枪并不是大招，将就用了
      
ultimate_release(Luffy())		# 'gomugomuno'
```

这是动态语言的*鸭子类型*，只要看起来像鸭子，能像鸭子一样踱步，那么它就是鸭子。

 
