---
layout: post
title: Git多账号的配置（基于macOS）
date: 2016-10-17 16:20:05 +0800
categories: [coding, git, deploy]
permalink: /:categories/:title
index: 5
---

## 为不同账户生成不同的SSH KEY

>为什么需要 SSH KEY？

　　SSH 密钥对可以让用户方便的登录到 SSH 服务器，而无需输入密码。由于无需发送密码到网络中，SSH 密钥对被认为是更加安全的方式。

　　对于 Git 用户来说，我们提交代码时，服务器要知道你是谁，你是否有权限执行修改代码等操作。这一系列的识别，便是通过 SSH KEY 来进行的。

废话不多说，我们此处假设有两个不同的账号，先分别为其生成独自的 SSH KEY。

```shell
# 第一个账户：
ssh-keygen -t rsa -C "xxxxxxx@gmail.com"
```
　　执行之后会要求输入 key 名，对于第一个 key 我们只要使用默认的名字即可，即`id_rsa`输入密码，只要一路回车即可，使用密码的话以后提交太麻烦。  
　　完成之后可以在`~/.ssh/`目录下找到`id_rsa.pub`和`id_rsa`两个文件，前者为公钥，后者为密钥。

```shell
# 第二个账户：
ssh-keygen -t rsa -C "xxxxxxx@outlook.com"
```
　　之后会要求输入 key 的名字，为了区别第一个用户，我们把这个 key 命名为`id_rsa_sec`，之后便可以一路回车。

　　一顿操作下来之后，我们可以在`~/.ssh/`目录下找到`id_rsa.pub`, `id_rsa`, `id_rsa_sec.pub`和`id_rsa_sec`四个文件。


## 检查是否有全局账户

```shell
git config --global user.name
git config --global user.email
```

若已存在全局账户，则会在终端显示出来，这时候我们需要把全局账户清除。

```shell
git config --global --unset user.name
git config --global --unset user.email
```

## 配置config文件
打开`~/.ssh/`目录下的`config`文件，输入以下内容：

```shell
# First Account
Host github.com
HostName github.com
User Mindjet
IdentityFile ~/.ssh/id_rsa

# Second Account
Host gitlab.com
HostName gitlab.com
User Gringe
IdentityFile ~/.ssh/id_rsa_sec
```

## 在仓库单独设置账户
假如上述的方法不适用，可以**直接**在你的项目根目录下设置该项目使用的**账户名**和**账户邮箱**。

```shell
in your repo $ git config user.name "xxx"
in your repo $ git config user.email "xxxx@gmail.com"
```

这样就完成对单独项目的账户设置了。








