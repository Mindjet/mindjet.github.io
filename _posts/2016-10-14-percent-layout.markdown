---
layout: post
title: PercentLayout
date: 2016-10-14 11:20:05 +0800
categories: [coding, android, percentlayout]
permalink: /:categories/:title
---

## 简介  
布局适配神器，像`css`一样为控件设置长宽百分比，鲁棒性很强。  

## 导入  
`PercentLayout`是`Google`的开源项目，此处使用 [@hongyangAndroid](https://github.com/hongyangAndroid/android-percent-support-extend) 的扩展库。  

通过以下语句导入：

{% highlight Gradle %}
compile 'com.zhy:percent-support-extends:1.1.1'
{% endhighlight %}

## 使用
 - 最外层需要用`percentLayout`嵌套，内层的`percentLayout`才能生效。

 - 需要引入命名空间`app`。  

 - `percentLayout`提供了三种布局：`PercentLinearLayout/PercentRelativeLayout/PercentFrameLayout`。  

 - 使用`app:layout_widthPercent/app:heightPercent`属性来设置宽度和高度，其`width/height`只需要设置成`wrap_content`即可。

 - 使用`xx%w`来设置为父控件宽度的某个百分比，使用`xx%h`来设置为父控件高度的某个百分比。

## 效果
<img src="/screenshots/percentlayout.png" width="250">

