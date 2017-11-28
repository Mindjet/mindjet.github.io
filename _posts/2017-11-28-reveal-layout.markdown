---
layout: post
title: 自定义View常识
date: 2017-09-01 16:20:05 +0800
categories: [coding, android, ui]
permalink: /:categories/:title
index: 14
---

> 
> RevealLayout 是一个用纯 Kotlin 代码编写的自定义 View，可以实现两个 Activity 之间的 reveal 转场动画。
> 

## 先睹为快

demo gif.



## 使用指导

### 依赖引入

在你的 app 模块的 `build.gradle` 中加入：

```groovy
implement 'com.github.mindjet.reveal-layout:1.0.0'
```

### 在布局文件中使用

```xml
<LinearLayout android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:orientation="vertical">
  
   <io.github.mindjet.reveallayout.RevealLayout
            android:id="@+id/reveal_layout"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />
  
</LinearLayout>
```

`RevealLayout` 应置于其他布局上方，以免被遮挡。

### 功能定制

使用 Java：

```java
  
```

使用 Kotlin 可以使代码更加简洁：

```kotlin
 
```

更多使用方法请参考 [demo](xxxx)



## 可定制参数

|       参数        | 数值类型 |         说明          |
| :-------------: | :--: | :-----------------: |
| revealDuration  | long | 转场到新 Activity 的动画时长 |
| concealDuration | long | 回到旧 Activity 的动画时长  |
|                 |      |                     |

