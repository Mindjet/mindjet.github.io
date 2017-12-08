---
layout: post
title: Python进阶-TCP/UDP
date: 2017-12-08 09:43:05 +0800
categories: [coding, python, advanced]
permalink: /:categories/:title
index: 10
---

## TCP

### socket

socket 表示网络连接，相当于建立了客户端和服务器的网络通路，打开一个 socket 需要目标计算机的 ip 地址和端口。

### 客户端

Python 中提供了 socket 模块来帮助编写网络编程代码。创建 socket 时，`AF_INET` 表示使用 IPv4 协议，`SOCK_STREAM` 表示建立 TCP 连接。

```python
import socket
```

我们创建一个 socket 对象，**创建后需要连接才能建立与服务店的网络通路**，这里假设服务器为 localhost，端口为 8080：

```python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server = ('127.0.0.1', 8080)
s.connect(server)
```

这样我们就建立起了与 localhost 的 TCP 连接，建立连接时，服务器可能会返回数据，来告知用户已连接成功：

```python
s.recv(1024).decode('utf-8')
```

由于在网络中都是以 bytes 形式传输的，所以这里我们需要解码。

此时 TCP 已成功建立，我们可以使用 socket 与服务器通信，同样要注意数据编码与解码：

```python
for item in [b'Genji', b'Hanzo', b'Mcree']:
    s.send(item)		# 发送
    print(s.recv(1024).decode('utf-8'))		#接收
s.send(b'exit')		# 发送
s.close()			# 单边关闭socket
```

### 服务端

服务器端也需要声明 socket，并监听 ip 和 端口：

```python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('127.0.0.1', 8080))
s.listen(5)		# 表示最大的等待数
```

这里可能会有点疑惑，一台服务器的 ip 不是固定的吗？其实还真不是。服务器可能会有多张网卡，也就有了多个 ip 地址，可以监听其中某个 ip 地址，也可使用 `0.0.0.0` 来监听所有网络地址，`127.0.0.1` 则表示

随后需要持续监听来自客户端的连接，每建立一个连接，就新建一个线程去处理该连接接下来的数据收发：

```python
from threading import Thread

while True:
    sock, addr = s.accept()
    t = Thread(target=tcplink, args=(sock, addr))
    t.start()
```

`socket.accept` 会一直等待连接，连接上了才会执行下一步操作。

线程的处理逻辑放在了 `tcplink` 方法中，将 `sock` 和 `addr` 作为参数传入：

```python
def tcplink(sock, addr):
    print('accept new connection from', addr)
    sock.send(b'welcome')
    while True:
        data = sock.recv(1024)
        if not data or data.decode('utf-8') == 'exit':
            break
        else:
            sock.send(('Hello %s' % data.decode('utf-8')).encode('utf-8'))
    sock.close()
```

可以看到，建立连接成功后，服务器端会发送 `welcome` 到客户端，然后持续去监听来自客户端的数据，并且发送数据给客户端，直到客户端发送 `exit` 才将当前连接关闭。

这就是 TCP 协议下服务端与客户端的交互方式。

## UDP

UDP 协议不同于 TCP，后者建立的是可靠连接，一旦信息通道建立后双方均可以以流的方式发送数据，而且包发送失败会重发；前者则是不基于连接的，也就是不需要建立连接，只需要知道 IP 和端口号就可以直接发数据，但并不能保证可靠性，即不保证是否数据达到。

UDP 虽然传输数据不可靠，但是速度快，对于不要求可靠到达的数据，可以用 UDP 协议。

那位说话了，“md，什么叫不要求可靠达到的数据？都丢包了还能正常吗？”您别说，还真的有挺多情况是这样的，特别是一些高频并发的网络通信，比如游戏、直播等等。因为丢一两个包并没有关系，可能在游戏中就玩家瞬移了一小步，直播中丢了一帧画面而已，它们更关注的是通信的继续，总不能丢个包就把游戏给直接断了吧？总不可能丢了一帧画面就把直播给关了吧？是吧。

### 客户端

创建 socket 的方式与 TCP 类似，`SOCK_DGRAM` 表示建立 UDP 连接。

由于不需要建立连接，所以 UDP 方式代码比较简单：

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server = ('127.0.0.1', 8080)
for item in [b'Genji', b'Hanzo', b'Mcree']:
    s.sendto(item, server)
    print(s.recv(1024).decode('utf-8'))
```

每次发送均需要制定服务器 IP 和 端口。

### 服务端

服务器端的逻辑也比较简单，因为不必像 TCP 一样每次建立连接后去持续监听来自客户端的数据：

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(('127.0.0.1', 8080))
while True:
    data, addr = s.recvfrom(1024)
    t = threading.Thread(target=udplink, args=(data, addr))
    t.start()
```

`recvfrom` 直接接收到客户端的地址和数据，然后新开线程在 `udplink` 中处理：

```python
def udplink(data, addr):
    s.sendto(('Hello,' + data.decode('utf-8')).encode('utf-8'), addr)
```

这就是 UDP 协议下服务端与客户端的交互方式。
