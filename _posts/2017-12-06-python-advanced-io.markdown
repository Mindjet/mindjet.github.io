---
layout: post
title: Python进阶-IO
date: 2017-12-06 19:31:05 +0800
categories: [coding, python, advanced]
permalink: /:categories/:title
index: 15
---

## 文件读写

### read

**文本**

比如读取同目录下一个 `README.md` 文件：

```python
f = open('./README.md', 'r')	# 等同于 f = open('./README.md')
content = f.read()
print(content)
f.close()
```

`open` 函数实际上是返回一个数据流，所以我们在用完之后必须要 `close` 掉，避免一直占用。

如果文件不存在，或者读文件时发生错误，都会抛出 `IOError` 异常，所以我们要捕获异常：

```python
try:
    f = open('./README.md')
    content = f.read()
    print(content)
except IOError as e:
    print(e)
finally:
    if f:
        f.close()
```

emmmmm，龟龟，这结构也太魔幻了吧。好在 Python 引入 `with` 语句来帮我们调用 `close` 并且捕获异常：

```python
with open('./README.md') as f:
    content = f.read()
    print(content)
```

这可瞬间清爽多了。

上面的 `f.read()` 其实是将文件的内容读取到内存中，但是如果这个文件很大，比内存还大，那内存直接就爆了，所以一般这种情况都会有机制可以解决：

```python
with open('./README.md') as f:
    for line in f.readlines():
        print(line.strip())
```

注意要使用 `strip()` 把行后的 `\n` 去掉，不然打印出来行与行之间会多出一个空行。

读取文本时，由于存在编码不同的情况，所以允许制定编码：

```python
f = open('./README.md', encoding='gbk')
```

文本中还可能存在一些非法编码的字符，此时会抛出 `UnicodeDecodeError`，我们可以选择对该异常的处理：

```python
f = open('./README.md', encoding='gbk', errors='ignore')
```

**二进制**

读取二进制文件，比如图片、视频等，需要制定读的模式 `rb`：

```python
f = open('./demo.png', 'rb')
```

**file-like object**

在 Python 中，使用 `open` 函数返回带有 `read()` 方法的对象，均称为 `file-like object`，可能是内存的字节流、网络数据流等等，类似于 Java 的 stream。

### write

写文件之前，也跟读文件一样，需要先打开 IO 流，比如我们写根目录下的 `README.md`：

```python
with open('./README.md', 'w') as f:
    f.write('Hello Python')
```

需要注意的是，如果这个文件不存在，那么会创建该文件后将内容写入。另外，`w` 的操作实际是将文件先清空再写入内容，如果想实现追加，应使用 `a`。 

也可以以行的方式写入，以 Iterable 的格式传入：

```python
with open('./README.md', 'w') as f:
    lines = ['Hello line' + str(content) + '\n' for content in range(11)]
    f.writelines(lines)
```

`write` 跟 `read` 操作一样，也需要在完成时 `close` 掉，一来是释放资源，二来是因为写操作实际上是先放到内存缓存起来，空闲时再写入，只有调用了 `close` 才会把内存中的缓存写入(flush)，这才算写入成功。所以，我们提倡使用 `with` 语句。

`write` 同样支持不同编码的写入，此处不再赘述。

## StringIO 和 BytesIO

上面我们说到的读和写，都是内存和其他储存介质之间的交互，而 `StringIO` 和 `BytesIO` 则是在内存之中进行的。

### StringIO

`StringIO` 是在内存中进行读写字符串的对象。

```python
from io import StringIO

f = StringIO()
with f:
    f.write('string io')
    print(f.getvalue())
```

```python
from io import StringIO

f = StringIO("string io\nline2")
with f:
    for line in f.readlines():
        print(line.strip())
```

可以看到，StringIO 的读写与普通文件的读写并没有太大区别，只是构建时不同而已。

### BytesIO

`StringIO` 是在内存中进行读写二进制的对象。

使用方法与 StringIO 类似，不再赘述。

### stream position

这里有必要讲一下 stream position 这个概念。我们在读写文件时，实际上是有一个指针在指向当前的读写位置的，就好像我们编辑文件时的光标，stream position 就相当于这个东西，它会根据你读和写来移动位置。

我们举 StringIO 的例子吧：

```python
f = StringIO()
with f:
    f.write('string io')
    print(f.getvalue())		# 'string io'
    print(f.read())			# ''
```

为什么 `f.read()` 会返回空字符串呢？

这是因为第三行的 `f.write()` 操作完成后，已经将 stream position 移动到文件末尾了，此时 `read` 是从当前位置读取到文件结束，自然就是空的了。

使用 `tell` 和 `seek` 可以获取和移动 stream position：

```python
f = StringIO()
with f:
    f.write('string io')
    print(f.tell())		# 9
    print(f.read())		# ''
    f.seek(0)
    print(f.read())		# 'string io'
```

好了，StringIO 讲了这么多，那它到底有什么用？？？其实，它就是保持和普通的文件 IO 的接口一致，构成 file-like object。

## 操作系统与文件系统

### 操作系统

Python 的 `os` 模块可以直接调用操作系统的接口函数。

```python
import os

os.name		
```

若 `os.name` 为 `posix`，则是 Unix, Linux 或者 Mac OS 系统，若为 `nt` 则是 Windows 系统。

使用 `os.environ` 可以获取系统的环境变量，`os.environ.get(key)` 可以获取特定的变量。

### 文件系统

**获取绝对路径：**

```python
os.path.abspath('.')
```

**拼接路径：**

```python
os.path.join('./static', 'style.css')
# './static/style.css'
```

有人说为啥不直接字符串拼接 `'./static/style.css'`？这是因为在不同操作系统中，分隔符是不一样的，有的是 `/` 有的是 `\`。

**拆分路径：**

```python
os.path.split('./static/style/base')
# ('./static/style', 'base')

os.path.split('./static/style/base.css')
# ('./static/style', 'base.css')
```

拆分路径时，始终是拆分成两部分，第二部分是最低级的目录或文件名。

**获取扩展名：**

```python
os.path.splitext('./static/style/base.css')
# ('./static/style/base', '.css')
```

拼接、拆分和获取扩展名都不要求目录或者文件真实存在，相当于只对字符串操作。

**创建删除目录：**

```python
os.mkdir('./static/style/base')
os.rmdir('./static/style/base')
```

**删除重命名文件：**

```python
os.rename(origin_name, new_name)
os.remove(name)
```

## 序列化与反序列化

### 序列化

序列化，就是将变量或者对象从内存中可以存储和传输的对象的过程。Python 中称为 `pickling`，Java 中咱们叫 `serialization`，其他语言也有其他叫法。

Python 提供 `pickle` 模块来实现序列化。

```python
dictionary = dict(name='genji', weapon='dart')
pickled = pickle.dumps(dictionary)
print(pickled)
# b'\x80\x03}q\x00(X\x06\x00\x00\x00weaponq\x01X\x04\x00\x00\x00dartq\x02X\x04\x00\x00\x00nameq\x03X\x05\x00\x00\x00genjiq\x04u.'
```

可以看到，`dictionary` 被序列化成了二进制文件。

可以使用 `pickle.dump` 方法来直接将被序列化的对象写入 file-like object：

```python
dictionary = dict(name='genji', weapon='dart')
with open('./dump.txt', 'wb') as f:
    pickle.dump(dictionary, f)
```

### 反序列化

反序列化即是序列化的逆过程，将可传输和储存的对象还原成内存中的变量或对象。

```python
with open('./dump.txt', 'rb') as f:
    dic = pickle.load(f)
    print(dic)
# {'name': 'genji', 'weapon': 'dart'}
```

### 使用 JSON

JSON 对象本身就是一个字符串，可以被所有语言读取，也方便传输和存储，而且性能更优。

JSON 的数据结构与 Python 中的对应表：

|    JSON     |   Python   |
| :---------: | :--------: |
|     {}      |    dict    |
|     []      |    list    |
|    "xxx"    |    str     |
| 123/2323.23 | int/float  |
| true/false  | True/False |
|    null     |    None    |

Python 中也内置了 `json` 模块来帮助我们使用 JSON 进行序列化操作。

先看序列化：

```python
import json

dictionary = dict(name='genji', weapon='dart')
jsoned = json.dumps(dictionary)
print(jsoned)
# '{"name": "genji", "weapon": "dart"}'
```

也可以序列化后直接保存到文件：

```python
import json

dictionary = dict(name='genji', weapon='dart')
with open('./dump.txt', 'w') as f:
    json.dump(dictionary, f)
```

再看反序列化：

```python
import json

with open('./dump.txt', 'r') as f:
    dic = json.load(f)
    print(dic)
# '{"name": "genji", "weapon": "dart"}'
```

