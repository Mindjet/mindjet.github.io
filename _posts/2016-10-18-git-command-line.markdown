---
layout: post
title: Git基本命令行
date: 2016-10-18 16:20:05 +0800
categories: [coding, git, commandline]
permalink: /:categories/:title
index: 6
---

## 远程操作

### (1) 将远程仓库克隆到本地

```bash
$ git clone https://github.com/Mindjet/way2android.git  //https方式
$ git clone git@github.com:Mindjet/way2android.git      //ssh方式
```

### (2) 将本地库推送到远程仓库
假设远程仓库为空，且未与本地仓库建立联系。  

- **建立连接**  

```bash
$ git remote add origin https://github.com/Mindjet/way2android.git  //https方式
$ git remote add origin git@github.com:Mindjet/way2android.git      //ssh方式
```
- **提交修改（此处指创建仓库）**

```bash
$ git commit -m "xxxxxxx"       //xxxxx部分指的是提交的说明
```

- **将本地修改推送到远程**

```bash
$ git push -u origin master
```
`-u`参数会把本地的`master`分支与远程的`master`分支关联起来，方便以后的操作。


## 本地操作

持续更新中...




