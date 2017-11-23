---
layout: post
title: Android 广播权限保护
date:  2017-11-23 10:20:05  0800
categories: [coding, android]
permalink: /:categories/:title
index: 10
---

## 为什么需要权限保护

### 无条件接收广播

比如说，一位将军对军队下令说：“如果听到**冲啊**，就发起攻击”。结果军队出了个奸细，大喊一声**冲啊**，所有士兵都开始冲锋，掉入敌人的陷阱，将军在军帐里傻了眼。

因为这位将军只告诉军队听到**冲啊**就发起攻击，并没有告知只有将军自己喊的才有效。

在 Android 中，就好像你注册了一个广播接受者（军队），却没有说明广播发送者需要的权限（将军令），无论哪里发来的广播都会响应，当然前提是 `action` 一致（都是**冲啊**）。如果广播接收者的响应涉及到敏感操作，那么很容易就会被攻击。

### 无条件发送广播

比如说，皇帝说：“五更时分，到太和殿上朝”。上朝时分一到，人叫那个多啊，不止是文武百官，后宫三千啊，太监啊，宫女啊，侍卫啊，全都挤进太和殿，皇帝在龙椅上傻了眼。

因为皇帝只告知**五更时分**就到太和殿上朝，并没有说明谁可以去谁不可以去。

这里说无条件发送广播，其实是不大恰当的，我们并没有能力去限制广播的发送，就好像限制不了五更时分的到来，我们只能限制哪些能作为广播接收者（文武百官）。

举个 Android 的例子，开机或者切换到新用户的时候都会发送一个 `BOOT_COMPLETED` 广播，如果这个广播不检查接收者的权限，假如三方应用都去注册这个广播，而且收到这个广播的时候把自己唤起，那么一开机一大堆 app 自启动，手机就得卡成马了。


## 限制广播发送者

上面我们说到，不能让广播接收者无条件地接收广播，只能接受拥有约定权限的发送者发来的广播。

我们在广播接收者一侧定义发送者应拥有的权限，并且在注册广播接收者时指明该权限：

```xml
<permission android:name="io.github.mindjet.SEND_PERMISSION" />

<receiver android:name="MyBroadcastReceiver"
        android:permission="io.github.mindjet.SEND_PERMISSION">
    <intent-filter>
            <action android:name="io.github.mindjet.JUST_BROADCAST" />
    </intent-filter>
</receiver>
```
在广播发送者一侧使用该权限：
```xml
<uses-permission android:name="io.github.mindjet.SEND_PERMISSION" />
```
之后便可以发送广播并接收了：
```java
sendBroadcast(new Intent("io.github.mindjet.JUST_BROADCAST"));
```
其他不拥有 `io.github.mindjet.SEND_PERMISSION` 权限的发送者可以将广播发送出去，但是接收者对其不理不睬。

## 限制广播接收者

上面说到，我们不能让广播发送者的广播随随便便地被接收者接收，只能让那些拥有约定权限的接收者接受。

我们在广播发送者一侧定义接收者应拥有的权限：
```xml
<permission android:name="io.github.mindjet.RECEIVE_PERMISSION" />
```
然后，在发送广播时，声明这是一条有权限检查的广播（第二个参数代表接收者应拥有的权限）：
```java
sendBroadcast(new Intent("io.github.mindjet.JUST_BROADCAST"), "io.github.mindjet.RECEIVE_PERMISSION");
```
接收者一侧则需要使用该权限：
```xml
<uses-permission android:name="io.github.mindjet.RECEIVE_PERMISSION" />
```
其他不拥有 `io.github.mindjet.RECEIVE_PERMISSION` 的接收者无权接收这个广播。

## 双向权限保护

双向保护其实就是把上面两种限制手段结合起来。

发送方说，你得有 XXX 权限才能接收我的广播；接收方说，你也得有 YYY 权限我才接收你的广播。

也就是说，发送方有接收方规定的发送权限的同时，接收方也得有发送方规定的接收权限。

那么发送方一侧：
```xml
<!-- 声明接收权限 -->
<permission android:name="io.github.mindjet.RECEIVE_PERMISSION" />
<!-- 使用发送权限 -->
<uses-permission android:name="io.github.mindjet.SEND_PERMISSION" />
```
同时发送广播时，使用带权限检查的方式：
```java
sendBroadcast(new Intent("io.github.mindjet.JUST_BROADCAST"), "io.github.mindjet.RECEIVE_PERMISSION");
```

相应地，接收方一侧：
```xml
<!-- 声明发送权限 -->
<permission android:name="io.github.mindjet.SEND_PERMISSION" />
<!-- 使用接收权限 -->
<uses-permission android:name="io.github.mindjet.RECEIVE_PERMISSION" />

<receiver android:name="MyBroadcastReceiver"
        android:permission="io.github.mindjet.SEND_PERMISSION">
    <intent-filter>
            <action android:name="io.github.mindjet.JUST_BROADCAST" />
    </intent-filter>
</receiver>
```
这样就能实现双向的权限保护了。

终于，将军在军帐里运筹帷幄，天子在龙椅上君临天下。

## protectionLevel

看了上面的例子，有人说，如果我是广播发送者，那我在 `AndroidManifest.xml` 里面声明使用发送权限不就好了，那权限保护还有什么用。

情况确实是这样，只要你能申请到，就有权限发送或者接收。所以为了更好地控制，我们需要声明权限的保护等级，即 `protectionLevel` 属性。

`protectionLevel` 有以下几个属性值：

```
normal              默认值，只要申请便能使用
dangerous           同上
signature           apk 签名一致才能使用
signatureOrSystem   apk 签名一致或者系统应用才能使用
```

比如说，一家公司开发出了几款产品（签名一致），并且定义了广播发送和接收权限，保护等级都是 `signature`：

```xml
<permission android:name="io.github.mindjet.SEND_PERMISSION"
        protectionLevel="signature" />
<permission android:name="io.github.mindjet.RECEIVE_PERMISSION"
        protectionLevel="signature" />
```
那么这两个权限，只有这家公司自家的产品可以申请到，也就避免了广播被外部 app 利用的情况。

### ———
技术上的问题，欢迎讨论。

最近在 [Github](https://github.com/Mindjet) 上维护的项目：
* [LiteWeather](https://github.com/Mindjet/LiteWeather) **[一款用 Kotlin 编写，基于 MD 风格的轻量天气 App]**，对使用 Kotlin 进行实际开发感兴趣的同学可以看看，项目中会使用到 Kotlin 的委托机制、扩展机制和各种新奇的玩意。
* [LiteReader](https://github.com/Mindjet/LiteReader) **[一款基于 MD 的极轻阅读 App，提供知乎日报、豆瓣电影等资源]**，项目主要使用了 MVVM 设计模式，界面遵循 Material Design 规范，提供轻量的阅读体验。
* [LiveMVVM](https://github.com/Mindjet/LiveMVVM) **[Kotlin 编写的 Android MVVM 框架，基于 android-architecture]**，轻量 MVVM+Databinding 开发框架。
* [AnkoUtil](https://github.com/Mindjet/AnkoUtil) **[Kotlin 编写的 Android 扩展库]**。

欢迎 star/fork/follow 提 issue 和 PR。

