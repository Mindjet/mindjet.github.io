---
layout: post
title: Kotlin+Databinding配置
date: 2017-12-11 13:51:05 +0800
categories: [coding, android, databinding]
permalink: /:categories/:title
index: 9
---

### 版本信息

Android Studio 3.0

```groovy
classpath 'com.android.tools.build:gradle:3.0.0'
classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.1.51"
```

### 配置
在 app 的 `build.gradle` 中：
```groovy
android {
    ...
    kapt.generateStubs true
    ...
}

dependencies {
    ...
    implementation"org.jetbrains.kotlin:kotlin-stdlib-jre7:1.1.51"
    kapt "com.android.databinding:compiler:3.0.0"
}
```
大功告成。
