---
layout: post
title: Android View 测量机制
date: 2017-12-01 17:39:05 +0800
categories: [coding, android, view]
permalink: /:categories/:title
index: 13
---

Android 中 View 的测量机制是 View 渲染机制的一个重要过程，理解 View 的测量机制和流程有利于我们加深对 View 渲染机制的理解、提高自定义 View 的能力。

View 的测量机制主要涉及到 **MeasureSpec**、**View 的测量** 和 **ViewGroup 的测量** 和这三个知识点，下面一一展开讲解。

## MeasureSpec

先看下面这样一个布局：

```xml
<FrameLayout
    android:layout_width="200dp"
    android:layout_height="200dp">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</FrameLayout>
```

最后我们在界面上看到的效果是，一个 200 dp 的正方形容器包裹了一个 `TextView`，该 `TextView` 占满了容器，即其宽高也是 200 dp。

那么，`FrameLayout` 是怎么告知 `TextView` 是怎么获知父容器的宽高的呢？`TextView` 又是怎么根据父容器的宽高来确定自己的宽度呢？这都跟 `MeasureSpec` 有关。

`MeasureSpec` 是对 View 的测量要求，它是一个 32 位的 int 值，高 2 为代表 `SpecMode`（测量模式），低 30 位代表 `SpecSize`（大小）。

`SpecMode` 有三种：

* `UNSPECIFIED`，大小不作限制
* `AT_MOST`，父容器对子 View 给定一个上限，子 View 可以去适应这个大小
* `EXACTLY`，精确大小，View 的大小即是 `SpecSize`

对于顶级 View（无上级 View，DecorView），其 MeasureSpec 是有窗口的尺寸和自身的 `Layoutparams` 共同确定的；而普通 View（包括 ViewGroup） 其 MeasureSpec 由父容器的 MeasureSpec 和本身的 `LayoutParams` 确定。

## View

View 的测量主要涉及到 `measure`， `onMeasure` 和 `setMeasuredDimension` 这三个方法。

`measure` 是被父容器调用的，根据传入的 `MeasureSpec` 结合自身的情况进行调整产生新的 `MeasureSpec`。

`onMeasure` 是在 `measure` 方法中被调用，传入新的 `MeasureSpec`。（作为回调，可以在自定义 View 中定制）

```java
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    setMeasuredDimension(getDefaultSize(getSuggestedMinimumWidth(), widthMeasureSpec),
            getDefaultSize(getSuggestedMinimumHeight(), heightMeasureSpec));
}
```

`setMeasureDimension` 是在 `onMeasure` 方法中被调用的，用以设置自身宽高，并将宽高保存起来。

```java
protected final void setMeasuredDimension(int measuredWidth, int measuredHeight) {
    boolean optical = isLayoutModeOptical(this);
    if (optical != isLayoutModeOptical(mParent)) {
        Insets insets = getOpticalInsets();
        int opticalWidth  = insets.left + insets.right;
        int opticalHeight = insets.top  + insets.bottom;

        measuredWidth  += optical ? opticalWidth  : -opticalWidth;
        measuredHeight += optical ? opticalHeight : -opticalHeight;
    }
    setMeasuredDimensionRaw(measuredWidth, measuredHeight);
}
```

## ViewGroup

我们先从 ViewGroup 如何确定子 View 的 `MeasureSpec` 说起。

ViewGroup 会遍历去测量子 View，ViewGroup 本身有一个 `MeasureSpec`，上面说到子 View 的 `MeasureSpec` 由其自身 `LayoutParams` 和父容器的 `MeasureSpec`  而产生。

`ViewGroup#measureChild` 中：

```java
protected void measureChild(View child, int parentWidthMeasureSpec,
        int parentHeightMeasureSpec) {
    final LayoutParams lp = child.getLayoutParams();

    final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
            mPaddingLeft + mPaddingRight, lp.width);
    final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
            mPaddingTop + mPaddingBottom, lp.height);

    child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
}
```

可以看到，子 View 宽度/高度 `MeasureSpec` 由 ViewGroup 的 `MeasureSpec` 、自身的 `LayoutParams`和 `padding` 共同产生。

接下来详细讲一下如何利用这三者生成子 View 的 `MeasureSpec`。

以下将子 View 称为 childView，父容器为 container。

假设我们是在生成 childView 的宽度 `MeasureSpec`。首先我们根据 container 的 `MeasureSpec` 获取其 `SpecMode` 和 `SpecSize`。将 `SpecSize` 减去 `padding` 即可得到父容器的内容宽度。

接着，我们按照 container的 `SpecMode` 分为三种情况：

* `EXACTLY`: container 宽度确定
  * childView 的宽度在布局文件中明确声明：那么 childView  的 `SpecMode=EXACTLY`，`SpecSize=明确的宽度` 
  * childView 的宽度为 `match_parent`，那么 childView 的 `SpecMode=EXACTLY`，`SpecSize=container内容宽度`
  * childView 的宽度为 `wrap_content`，那么 childView 的 `SpecMode=AT_MOST`，`SpecSize=container内容宽度`
* `AT_MOST`: container 宽度上限确定
  * childView 的宽度在布局文件中明确声明：那么 childView  的 `SpecMode=EXACTLY`，`SpecSize=明确的宽度` 
  * childView 的宽度为 `match_parent`，那么 childView 的 `SpecMode=AT_MOST`，`SpecSize=container内容宽度`
  * childView 的宽度为 `wrap_content`，那么 childView 的 `SpecMode=AT_MOST`，`SpecSize=container内容宽度`
* `UNSPECIFIED`：container 宽度宽度不指定
  * childView 的宽度在布局文件中明确声明：那么 childView  的 `SpecMode=EXACTLY`，`SpecSize=明确的宽度` 
  * childView 的宽度为 `match_parent`，那么 childView 的 `SpecMode=UNSPECIFIED`，`SpecSize=container内容宽度或0`
  * childView 的宽度为 `wrap_content`，那么 childView 的 `SpecMode=UNSPECIFIED`，`SpecSize=container内容宽度或0`

这部分的实现逻辑在 `ViewGroup#getChildMeasureSpec` 中：

```java
public static int getChildMeasureSpec(int spec, int padding, int childDimension) {
        int specMode = MeasureSpec.getMode(spec);
        int specSize = MeasureSpec.getSize(spec);

        int size = Math.max(0, specSize - padding);

        int resultSize = 0;
        int resultMode = 0;

        switch (specMode) {
        // Parent has imposed an exact size on us
        case MeasureSpec.EXACTLY:
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {
                // Child wants to be our size. So be it.
                resultSize = size;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {
                // Child wants to determine its own size. It can't be
                // bigger than us.
                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            }
            break;

        // Parent has imposed a maximum size on us
        case MeasureSpec.AT_MOST:
            if (childDimension >= 0) {
                // Child wants a specific size... so be it
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {
                // Child wants to be our size, but our size is not fixed.
                // Constrain child to not be bigger than us.
                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {
                // Child wants to determine its own size. It can't be
                // bigger than us.
                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            }
            break;

        // Parent asked to see how big we want to be
        case MeasureSpec.UNSPECIFIED:
            if (childDimension >= 0) {
                // Child wants a specific size... let him have it
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {
                // Child wants to be our size... find out how big it should
                // be
                resultSize = View.sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                resultMode = MeasureSpec.UNSPECIFIED;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {
                // Child wants to determine its own size.... find out how
                // big it should be
                resultSize = View.sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                resultMode = MeasureSpec.UNSPECIFIED;
            }
            break;
        }
        //noinspection ResourceType
        return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
    }
```

确定了子 View 的 `MeasureSpec`，我们看回 `ViewGroup#measureChild`：

```java
protected void measureChild(View child, int parentWidthMeasureSpec,
        int parentHeightMeasureSpec) {
    final LayoutParams lp = child.getLayoutParams();

    final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
            mPaddingLeft + mPaddingRight, lp.width);
    final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
            mPaddingTop + mPaddingBottom, lp.height);

    child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
}
```

注意到最后一句，我们调用了子 View 的 `measure` 方法，它会根据我们确定的 `MeasureSpec` 去测量自身。

而 `measureChild` 这个方法是在` ViewGroup#onMeasure` 中遍历调用：

```java
for (int i = 0; i < mMainViewList.size(); i++) {
    View mainView = mMainViewList.get(i);
    if (mainView.getVisibility() != View.GONE) {
        measureChild(mainView, unspecifiedSpec, unspecifiedSpec);
        mMeasuredWidth = Math.max(mMeasuredWidth, mainView.getMeasuredWidth());
        mainHeight += mainView.getMeasuredHeight();
        state = View.combineMeasuredStates(state, mainView.getMeasuredState());
    }
}
```

可以看到，ViewGroup 遍历了其下所有的子 View，让它们根据 `MeasureSpec` 去测量自身，然后获取它们测量后的大小，然后确定自身大小，再保存起来。

## 回顾

我们看回开头的例子：

```xml
<FrameLayout
    android:layout_width="200dp"
    android:layout_height="200dp">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</FrameLayout>
```

这个结构的测量流程是：

* `FrameLayout` 根据自身的 `MeasureSpec`(SpecMode=EXACTLY，SpecSize=200dp) 和 `TextView` 的 `LayoutParams`(match_parent)，产生 `TextView` 的 `MeasureSpec`(SpecMode=EXACTLY，SpecSize=200dp)
* 让 `TextView` 测量自身并确定宽高
* `FrameLayout` 获取  `TextView` 大小再确定自身大小
