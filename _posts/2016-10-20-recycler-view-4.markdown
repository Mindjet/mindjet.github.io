---
layout: post
title: RecyclerView-4 (drag and swipe)
date: 2016-10-20 16:20:05 +0800
categories: [coding, android, recyclerview]
permalink: /:categories/:title
---

更多关于`RecyclerView`：  
- [RecyclerView(介绍与简单使用)](recycler-view-1.html)  
- [RecyclerView(布局)](recycler-view-2.html)  
- [RecyclerView(监听器)](recycler-view-3.html)

这一次主要是关于`ItemTouchHelper`实现拖拽、滑动的效果。

## ItemTouchHelper

>This is a utility class to add swipe to dismiss and drag & drop support to RecyclerView.

>It works with a RecyclerView and a Callback class, which configures what type of interactions are enabled and also receives events when user performs these actions.  
>
><p style="text-align:right">——Android Developer</p>

上面那句话是`Google`官方的介绍。

>ItemTouchHelper是一个工具类，协助RecyclerView来实现滑动删除、拖拽和摆放。
>
>ItemTouchHelper需要RecyclerView和Callback类。Callback类定义了被允许的交互类型，在用户进行这些交互操作时接受交互事件。

翻译过来差不多就是这样。  

`ItemTouchHelper`的实例化需要`ItemTouchHelper.Callback`作为参数：

{% highlight Java %}
mItemTouchHelper = new ItemTouchHelper(ItemTouchHelper.Callback callback);
{% endhighlight %}

## ItemTouchHelper.Callback

`ItemTouchHelper.Callback`是一个静态抽象类，一般重写的方法有下列几个：

### getMovementFlags
该方法规定了`item`拖拽和滑动的方向。

{% highlight Java %}
public int getMovementFlags(RecyclerView recyclerView, RecyclerView.ViewHolder viewHolder) {
    int dragFlags = 0, swipeFlags = 0;
    if (recyclerView.getLayoutManager() instanceof LinearLayoutManager) {
        dragFlags = ItemTouchHelper.UP | ItemTouchHelper.DOWN;
        swipeFlags = ItemTouchHelper.START | ItemTouchHelper.END;
    } else if (recyclerView.getLayoutManager() instanceof StaggeredGridLayoutManager) {
        dragFlags = ItemTouchHelper.UP | ItemTouchHelper.DOWN | ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT;
        swipeFlags = ItemTouchHelper.START | ItemTouchHelper.END;
    }
    return makeMovementFlags(dragFlags, swipeFlags);
}
{% endhighlight %}

`dragFlags`和`swipeFlags`分别代表拖拽的方向和滑动的方向。  

在该方法中，根据`LayoutManager`的类型来设置`dragFlags`和`swipeFlags`。当`LayoutManager`为`LinearLayoutManager`时，设置`dragFlags`为上下滑动和`swipeFlags`为左右滑动。

方法返回类型为`int`，可以通过`makeMovementFlag`并传入设置的两个参数来生成返回值。

### onMove
该方法在`item`被移动时被调用，通常作数据的交换处理。

{% highlight Java %}
public boolean onMove(RecyclerView recyclerView, RecyclerView.ViewHolder viewHolder, RecyclerView.ViewHolder target) {
	int from = viewHolder.getAdapterPosition();
	int to = target.getAdapterPosition();
	Collections.swap(adapter.data, from, to);
	adapter.notifyItemMoved(from, to);
	return true;
}
{% endhighlight %}

在本例中，通过`viewHolder`的`getAdapterPosition`方法得到被移动`item`和目前位置的`item`各自在数据源中的索引，利用索引交换数据源中对应的值，并使用`adapter.notifyItemMoved()`来更新视图。  

返回值为`true`说明确认`item`被移动到目标位置。

### onSwiped
该方法在`item`被滑动**完成**后调用，一般滑动指的是左右滑动。可以在这个方法里面作数据的删除操作。

{% highlight Java %}
public void onSwiped(RecyclerView.ViewHolder viewHolder, int direction) {
	int apos = viewHolder.getAdapterPosition();
	int lpos = viewHolder.getLayoutPosition();
	adapter.notifyItemRemoved(lpos);
	adapter.data.remove(apos);
}
{% endhighlight %}

### onSelectedChanged
该方法在`item`的状态开始改变时调用。可以在方法里判断`actionState`的值来作出相应操作，如`actionState`判定为拖拽时改变`item`的背景等。

{% highlight Java %}
public void onSelectedChanged(RecyclerView.ViewHolder viewHolder, int actionState) {
	super.onSelectedChanged(viewHolder, actionState);
	if (actionState==ItemTouchHelper.ACTION_STATE_DRAG) {
			viewHolder.itemView.setBackground(ContextCompat.getDrawable(DragAnimActivity.this, R.drawable.radius_highlight));
	}
}
{% endhighlight %}

### onChildDraw
该方法在`item`的状态正在改变时调用，也可以通过`actionState`作出相应操作，比如在方法里作一些动画效果。此处在`actionState`判定为滑动时，使`item`的透明度随着滑动距离而变化。

{% highlight Java %}
public void onChildDraw(Canvas c, RecyclerView recyclerView, RecyclerView.ViewHolder viewHolder, float dX, float dY, int actionState, boolean isCurrentlyActive) {
	super.onChildDraw(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive);
	if (actionState == ItemTouchHelper.ACTION_STATE_SWIPE) {
			viewHolder.itemView.setAlpha(1 - Math.abs(dX) / 1080);
	}
}
{% endhighlight %}

### clearView
该方法在`item`的状态改变结束时调用，一般用来清除`onSelectedChanged`中设置的样式（重置样式）。同样可以通过判定`actionState`的数值来作出不同操作。

{% highlight Java %}
public void clearView(RecyclerView recyclerView, RecyclerView.ViewHolder viewHolder) {
	super.clearView(recyclerView, viewHolder);
	viewHolder.itemView.setBackground(ContextCompat.getDrawable(DragAnimActivity.this, R.drawable.radius_white));
}
{% endhighlight %}

## 效果
<img src="/screenshots/recycler-view-anim.gif"/>


## 总结
不想说太多，`RecyclerView`就是好用。


