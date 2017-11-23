---
layout: post
title: Gradle命令行
date: 2016-12-29 17:11:05 +0800
categories: [coding, android, gradle]
permalink: /:categories/:title
index: 6
---

#### 查看 build 日志

在 Android Studio 的 `Terminal` 工具中输入：

```bash
./gradlew build -profile
```

可以输出 build 的日志，日志中详细描述了 build 过程中各个 module 耗时以及各个 Task 耗时等。
