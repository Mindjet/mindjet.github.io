---
layout: post
title: 自定义View常识
date: 2017-09-01 16:20:05 +0800
categories: [coding, android, ui]
permalink: /:categories/:title
index: 5
---

## 背景
假设我们自定义了一个叫 `CustomView` 的 `View`，并在 `attrs.xml` 中为其创建 `declare-styleable`:  

```xml
    <declare-styleable name="CustomView">
        <attr name="cv_background" format="color" />
        <attr name="cv_radius" format="dimension" />
        <attr name="cv_text" format="string" />
    </declare-styleable>
```

## 注意点

### 一定要用自定义控件的类名作为 `name`吗？
其实不然，`declare-styleable` 后面的 `name` 可以随意设置，甚至可以直接把 `declare-styleable` 标签去掉。只不过 `name` 的存在是有意义的，就是在获取自定义 `View` 内部获取这些自定义属性的时候，`name` 可以作为索引，方便代码提示也能让开发者更加明确属性到底属于哪个 `View`。

### 可以用系统已经存在的属性吗？
比如说上面我用到了一个 `cv_text` 的属性，其实功能就是相当于 `android:text`，此处我们可以直接用 `android:text`吗？当然可以，不过不用指定 `format` 了，如下所示：  
```xml
    <declare-styleable name="CustomView">
        <attr name="cv_background" format="color" />
        <attr name="cv_radius" format="dimension" />
        <attr name="android:text" />
    </declare-styleable>
```

### TypedArray 干嘛的？
在自定义 `View` 类文件中，我们通过类似以下的代码来获取到自定义属性：  

```java
public CustomView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.CustomView);
    mBackground = ta.getColor(R.styleable.CustomView_cv_background, DEFAULT_BACKGROUND);
    mRadius = ta.getDimensionPixelOffset(R.styleable.CustomView_cv_radius, 0);
    ta.recycle();
}
```

实际上，我们可以直接从 `AttributeSet` 获得这些属性:

```java
for (int i = 0; i < attrs.getAttributeCount(); i++) {
     attrs.getAttributeResourceValue(i,0);
}
```

这种做法确实可以，但是有局限性，即当自定义属性的值是引用了资源时不能解析拿到最终的数值：

```xml
<io.github.mindjet.jwidget.view.custom.CustomView
    android:layout_width="match_parent"
    android:layout_height="100dp"
    android:layout_margin="10dp"
    app:cv_background="@color/colorPrimary"
    app:cv_radius="10dp" />
```

如上面 `cv_background` 属性引用了颜色资源，直接按照上面的方式则不能解析拿到最终的颜色数值。  
讲到这里，`TypedArray` 的作用就不言而喻了，就是帮助解析资源。


[参考文档](http://blog.csdn.net/lmj623565791/article/details/45022631)

