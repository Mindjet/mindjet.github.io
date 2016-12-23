---
layout: post
title: Ripple Effect
date: 2016-12-20 23:03:05 +0800
categories: [coding, android, ui]
permalink: /:categories/:title
index: 2
---

## 简介

`Ripple Effect` 是在 Android L （即 API 21）引入的新特性，带有 Ripple Effect 的控件在用户点按时，能够产生动态的水波纹效果，使交互更加清晰和真实。

## 简单的 Ripple Effect

### 代码实现

我们在 `res/drawable-v21/` 下建立新文件 `ripple_default.xml`：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="?android:colorControlHighlight">
    <item
        android:id="@android:id/mask"
        android:drawable="@android:color/white" />
</ripple>
{% endhighlight %}

注意到我们使用了 `ripple` 这个 tag。

以上文件之所以建立在 drawable-v21 下，是由于 Ripple Effect 在 API 21 及之后的版本才引入。同时我们为了向下兼容，在 `drawable` 文件夹下，也应新建 `ripple_default.xml` 文件：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/button_press" android:state_pressed="true" />
    <item android:drawable="@color/transparent" />
</selector>
{% endhighlight %}

注意到我们使用了常见的 `selector` 这个标签。

之后，主要给控件加上以下属性即可：

{% highlight XML %}
<TextView
  ...
  android:background="@drawable/ripple_defaul"/>
{% endhighlight %}

### 具体效果

<img src="/screenshots/simple-ripple-effect.gif"/>


## 进阶的 Ripple Effect

简单的 Ripple Effect 只能纯粹地产生水波纹，如果想要设置控件的其他属性，如 corner、background、stroke 等，也需要通过 `android:background` 这个属性来设置，这就跟 ripple effect 冲突了（因为 ripple effect 也是通过 android:background 设置）。

但事实上，在 `ripple` 标签中，也可以设置 corner 等属性。

### 代码实现

在 `drawable-v21` 文件夹下，建立 `ripple_corner.xml` 文件：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
        android:color="?android:colorControlHighlight">
    <item
        android:id="@android:id/mask"
        android:drawable="@drawable/shape_item_default"/>
    <item android:drawable="@drawable/shape_item_default"/>
</ripple>
{% endhighlight %}

其中，`shape_item_default.xml` 是一个 `shape`（以 shape 为根节点）型的资源文件：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@color/white"/>
    <corners android:radius="@dimen/dp_5"/>
</shape>
{% endhighlight %}

其中定义了背景颜色（solid节点）和圆角（corners），当然你可以再添加尺寸（size节点）、边框（stroke节点）和渐变（gradient）。

同时为了向下兼容，我们也在 `drawable` 文件夹下建立 `ripple_corner.xml`：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/shape_item_pressed" android:state_pressed="true"/>
    <item android:drawable="@drawable/shape_item_default"/>
</selector>
{% endhighlight %}

其中，`shape_item_pressed.xml` 也是 `shape` （以 shape 为根节点）型的资源文件：

{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#ececec"/>
    <corners android:radius="@dimen/dp_5"/>
</shape>
{% endhighlight %}

另外，使用简单的 Ripple Effect 时，`android:elevation` 无法生效，而是用进阶的 Ripple Effect 则可以。

### 具体效果

<img src="/screenshots/advanced-ripple-effect.gif"/>

