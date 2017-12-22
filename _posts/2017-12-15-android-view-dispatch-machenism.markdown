---
layout: post
title: Android View 事件分发机制
date: 2017-12-15 18:11:05 +0800
categories: [coding, android, view]
permalink: /:categories/:title
index: 7
---

## View

先说说 View 上的事件分发机制。

### click and touch

click 和 touch 是我们用户对空间的常见操作，举个例子，为 button 绑定 click 和 touch listener：

```java
Button btn = findViewById(R.id.btn);
btn.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Log.i("btn", "btn is clicked");
    }
});
btn.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        Log.i("btn", "btn is touched");
        return false;
    }
});
```

按下按钮再抬起，logcat 打印出：

```
I/btn: btn is touched
I/btn: btn is touched
I/btn: btn is clicked
```

这很好解释，因为此处 `onTouchListener` 会监听 3 种操作：`MotionEvent.ACTION_DOWN`，`MotionEvent.ACTION_MOVE`， 和 `MotionEvent.ACTION_UP`。所以按下抬起必然会各调用一次。如果按下到抬起之前，手指在屏幕移动，那么`btn is touched` 会多次打印。

我们也发现，`onClick` 也会在最后响应，说明 `onClick` 是在 `onTouch` 之后并且是 `ACTION_UP` 之后被执行。

注意到，`onTouch` 有一个返回值，这个返回值代表着是否消费事件，返回 false 说明该事件没被消费，还可以继续传播。我们将其改为 true 试试：

```java
btn.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        Log.i("btn", "btn is touched");
        return true;
    }
});
```

```
I/btn: btn is touched
I/btn: btn is touched
```

果不其然，`onClick` 没有被调用，说明事件传到 `onTouch` 之后就不往下走了。

### dispatchTouchEvent

所以，View 的事件分发机制（严格意义上讲，View 本身并不用事件分发）就这么简单？？？当然不是，View 内部有一个 `dispatchTouchEvent` 方法，我们 dig 进去：

```java
/**
 * Pass the touch screen motion event down to the target view, or this
 * view if it is the target.
 *
 * @param event The motion event to be dispatched.
 * @return True if the event was handled by the view, false otherwise.
 */
public boolean dispatchTouchEvent(MotionEvent event) {
    ...
      
    boolean result = false;

    if (onFilterTouchEventForSecurity(event)) {
        if ((mViewFlags & ENABLED_MASK) == ENABLED && handleScrollBarDragging(event)) {
            result = true;
        }
        //noinspection SimplifiableIfStatement
        ListenerInfo li = mListenerInfo;
        if (li != null && li.mOnTouchListener != null&& (mViewFlags & ENABLED_MASK) == ENABLED && li.mOnTouchListener.onTouch(this, event)) {
            result = true;
        }

        if (!result && onTouchEvent(event)) {
            result = true;
        }
    }

    return result;
}
```

我们先认识一点：**触摸控件时，第一个触发的是 `dispatchTouchEvent`。**

注释说，将屏幕的触摸事件传递给目标 view，如果自己是目标 view 那就传给自己；同时，返回值表示触摸事件是否被消费。有人觉得疑惑，为啥 view 都不包含子 view 了还要将触摸事件传递给目标 view？这是因为 ViewGroup 也是继承于 View 的，前者就会有将触摸事件传递给目标子 view 的情况。

先说明一下两个点：

* `(mViewFlags & ENABLED_MASK) == ENABLED` 表示该 view 为**可用的**
* `handleScrollBarDragging` 如果返回 true 表示事件作用于 scrollbar，反之亦然

从 `dispatchTouchEvent` 中，可以发现以下几种情况都会使事件被消费：

1. 该 view **可用**且点击事件作用于 scrollbar
2. 该 view **可用**且 `OnTouchListener.onTouch` 返回 true （外部拦截）
3. 以上都不成立，但 view 本身 `onTouchEvent` 返回 true （自身拦截）

如果以上三条都不成立，那么 view 就不会消费事件了。

### onTouchEvent

好，那么 `onClick` 在哪里被调用？根据我们之前的推断，如果 `onTouch` 返回 false，那么 `onClick` 就可以被调用，这么看来，`onClick` 的调用应该是藏在了 `onTouchEvent` 里面。

可以看看 `onTouchEvent`，这里也简化了代码：

```java
public boolean onTouchEvent(MotionEvent event) {
    final float x = event.getX();
    final float y = event.getY();
    final int viewFlags = mViewFlags;
    final int action = event.getAction();

    final boolean clickable = ((viewFlags & CLICKABLE) == CLICKABLE
            || (viewFlags & LONG_CLICKABLE) == LONG_CLICKABLE)
            || (viewFlags & CONTEXT_CLICKABLE) == CONTEXT_CLICKABLE;

    if (clickable || (viewFlags & TOOLTIP) == TOOLTIP) {
        switch (action) {
            case MotionEvent.ACTION_UP:
                boolean prepressed = (mPrivateFlags & PFLAG_PREPRESSED) != 0;
                if ((mPrivateFlags & PFLAG_PRESSED) != 0 || prepressed) {
                    boolean focusTaken = false;
                    if (!mHasPerformedLongPress && !mIgnoreNextUpEvent) {
                        if (!focusTaken) {
                            mPerformClick = new PerformClick();
                        }
                        if (!post(mPerformClick)) {
                            performClick();
                        }
                    }
                }
                break;

            case MotionEvent.ACTION_DOWN:
				...
        }
        return true;
    }
    return false;
}
```

主要关注 `MotionEvent.ACTION_UP` 这个 case，可以看到里面调用了 `performClick()`，这个方法的内容：

```java
public boolean performClick() {
    final boolean result;
    final ListenerInfo li = mListenerInfo;
    if (li != null && li.mOnClickListener != null) {
        playSoundEffect(SoundEffectConstants.CLICK);
        li.mOnClickListener.onClick(this);
        result = true;
    } else {
        result = false;
    }
    return result;
}
```

恩，真相大白了，可以清晰地看到 `mOnClickListener.onClick(this)`。

### ACTION_DOWN

然而，进入了 `onTouchEvent` 的 `ACTION_UP` case，`performClick` 也可能不会被调用。

我们理一理，既然能进入 `onTouchEvent`  的 `ACTION_UP` case，说明 `OnTouchListener.onTouch` 对于 `ACTION_UP` 这种情况肯定返回了 false，即没有拦截。既然没有拦截，那为哈还存在没有调用 `performClick`的情况？

注意到，`performClick` 有一个先决条件：

```java
boolean prepressed = (mPrivateFlags & PFLAG_PREPRESSED) != 0;
if ((mPrivateFlags & PFLAG_PRESSED) != 0 || prepressed)
```

判断 view 是否已经为 press 或者 prepress 状态。这个状态是在要 `onTouchEvent` 的 `ACTION_DOWN` case 中使能的。也就是说，如果  `onTouchEvent` 的 `ACTION_DOWN` case 被拦截了，被 `OnTouchListener.onTouch` 拦截了，那就不能使能了，也就导致 `performClick` 不能被调用了。

```java
btn.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                return true;
            case MotionEvent.ACTION_UP:
                return false;
        }
        return false;
    }
});
```

所以，一般我们都会在 `onTouch` 的 `ACTION_DOWN` case 中返回 false。

**总结一哈：**

1. 触摸 view 时会调用其 `dispatchTouchEvent` 开始进行事件分发
2. 如果 view 可用并且事件交由 scrollbar 处理，则不再向下执行
3. 如果 view 可用并且 `onTouchListener` 存在，则执行其 `onTouch` 方法，如果该方法返回 true，则不再向下执行
4. 如果 view 可用，则执行 view 内部的 `onTouchEvent` 方法，在该方法中 `ACTION_UP` 的 case 有**可能**会调用到 `performClick` 方法使 `OnClickListener.onClick` 方法被调用
5. `onTouchListener` 的 `onTouch` 方法 `ACTION_DOWN` case 一般返回 false 以保证其他动作的正常执行

## ViewGroup

ViewGroup 其实也是 View，只不过多了维护子 view 和布局参数的特点。

那么，点击 ViewGroup 中的 View，事件是怎么走的呢？我们说分发，那么应该是容器接收在派发给容器中的元素，即 ViewGroup 接收事件再分发给子 View 们。

我们写个 demo 来验证我们的猜想。

先定义一个自己的 ViewGroup：

```java
public class MyViewGroup extends LinearLayout {

    public MyViewGroup(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }
}
```

并且在布局中添加两个按钮：

```xml
<com.huawei.hwfwkdemo.MyViewGroup
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <Button
        android:id="@+id/btn1"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="btn 1" />

    <Button
        android:id="@+id/btn2"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="btn 2" />

</com.huawei.hwfwkdemo.MyViewGroup>
```

然后，我们为 ViewGroup 绑定 `onTouch` 事件，两个按钮绑定 `onClick` 事件：

```java
myViewGroup.setOnTouchListener(new View.OnTouchListener() {
    @Override
    public boolean onTouch(View v, MotionEvent event) {
        Log.i(TAG, "MyViewGroup is clicked");
        return false;
    }
});
btn1.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Log.i(TAG, "btn1 is clicked");
    }
});
btn2.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Log.i(TAG, "btn2 is clicked");
    }
});
```

然后我们依次点击 btn1、btn2、空白区域，logcat 打印出：

```
I/tag: btn1 is clicked
I/tag: btn2 is clicked
I/tag: MyViewGroup is clicked
```

可见，点击按钮时，点击事件被按钮消费掉，ViewGroup 的 `onTouch` 没有执行，只有点击空白区域才执行 。

那这样是不是跟我们的猜想相悖了？我们预想的是 ViewGroup 最先捕获点击事件，再分发给子 View。但现在看来是子 View 先捕获了点击事件？？？

表面上看是这样的，但是我们还是往源码里边一谈究竟。

我们在 View 的点击事件中说过，触摸一个 View，其 `dispatchTouchEvent` 最先被触发，那我们看看 ViewGroup 的 `dispatchTouchEvent` 方法，截取其中一部分：

```java
@Override
public boolean dispatchTouchEvent(MotionEvent ev) {  
    final int action = ev.getAction();  
    final float xf = ev.getX();  
    final float yf = ev.getY();  
    final float scrolledXFloat = xf + mScrollX;  
    final float scrolledYFloat = yf + mScrollY;  
    final Rect frame = mTempRect;  
    boolean disallowIntercept = (mGroupFlags & FLAG_DISALLOW_INTERCEPT) != 0;  
    if (action == MotionEvent.ACTION_DOWN) {  
        if (mMotionTarget != null) {  
            mMotionTarget = null;  
        }  
        if (disallowIntercept || !onInterceptTouchEvent(ev)) {  
            ev.setAction(MotionEvent.ACTION_DOWN);  
            final int scrolledXInt = (int) scrolledXFloat;  
            final int scrolledYInt = (int) scrolledYFloat;  
            final View[] children = mChildren;  
            final int count = mChildrenCount;  
            for (int i = count - 1; i >= 0; i--) {  
                final View child = children[i];  
                if ((child.mViewFlags & VISIBILITY_MASK) == VISIBLE  
                        || child.getAnimation() != null) {  
                    child.getHitRect(frame);  
                    if (frame.contains(scrolledXInt, scrolledYInt)) {  
                        final float xc = scrolledXFloat - child.mLeft;  
                        final float yc = scrolledYFloat - child.mTop;  
                        ev.setLocation(xc, yc);  
                        child.mPrivateFlags &= ~CANCEL_NEXT_UP_EVENT;  
                        if (child.dispatchTouchEvent(ev))  {  
                            mMotionTarget = child;  
                            return true;  
                        }  
                    }  
                }  
            }  
        }  
    }  
    ...
    return target.dispatchTouchEvent(ev);  
}  
```

注意到其中的判断语句 `disallowIntercept || !onInterceptTouchEvent(ev)`，`disallowIntercept` 是代表是否禁用拦截功能，一般是 false，也就是说这个语句的返回值完全取决于 `onInterceptTouchEvent` 方法：

```java
public boolean onInterceptTouchEvent(MotionEvent ev) {  
    return false;  
} 
```

可见，该方法默认返回 false，即不拦截触摸事件。(Android API 26 的代码没有这么简单，但是一般情况下还是返回 false)

也就是说，`onInterceptTouchEvent` 返回 false 之后，在 `dispatchTouchEvent` 中调用了被点击子 View 的 `dispatchTouchEvent` 的方法，将触摸事件分发下去，而且若子 View 的 `dispatchTouchEvent` 方法返回 true，那么该 ViewGroup 的 `dispatchTouchEvent` 直接返回 true，那么其 `onTouch` 不会被执行。

**总结一哈：**

1. ViewGroup 的 `dispatchTouchEvent` 最先处理触摸事件
2. 若 ViewGroup 的 `onInterceptTouchEvent` 返回 true 则拦截事件，所有子 View 都不会相应，反之则进行下一步
3. 根据触摸的坐标来判断目标子 View，并调用子 View 的 `dispatchTouchEvent` 方法，若该方法返回 true，则直接完成触摸事件的处理，否则则进行 ViewGroup 自身对触摸事件的相应，如 `onTouch`、`onTouchEvent` 等。



#### 参考文献

[Android事件分发机制完全解析，带你从源码的角度彻底理解(上)](http://blog.csdn.net/guolin_blog/article/details/9097463)

[Android事件分发机制完全解析，带你从源码的角度彻底理解(下)](http://blog.csdn.net/guolin_blog/article/details/9153747)

