---
layout: post
title: RecyclerView-2 (多类型与瀑布流) 
date: 2016-10-20 10:20:05 +0800
categories: [coding, android, recyclerview]
permalink: /:categories/:title
---

对于`RecyclerView`更加基础的理解，请看[RecyclerView-1](recycler-view-1.html)。

## 引言
以下将介绍使用`RecyclerView`实现：  
- 多类型`item`显示  
- 瀑布流效果。

## 多类型的item
在[RecyclerView-1](recycler-view-1.html)中，只实现了简单的文本`item`，即`item`类型是单类型的，也就意味着只需要一种`ViewHolder`。但`RecylerView`的高扩展性不是盖的，它能做的不只是这些。  

假设有两种类型的`item`，一种是只有`Button`，另一种是有`TextView`和`ImageView`。

自定义名为`MultiItemAdapter`，继承于`RecyclerAdapter<RecylerView.ViewHolder>`的适配器，需要编写两个`ViewHolder`，并重写`getItemViewType`、`onCreateViewHolder`和`onBindViewHolder`方法。

### 1. 编写两个ViewHolder
`ButtonViewHolder`:

{% highlight Java %}
public static class ButtonViewHolder extends RecyclerView.ViewHolder {
    Button mButton;

    public ButtonViewHolder(View itemView) {
        super(itemView);
        mButton = (Button) itemView.findViewById(R.id.id_button);
    }
}
{% endhighlight %}

`ImageViewHolder`:

{% highlight Java %}
public static class ImageViewHolder extends RecyclerView.ViewHolder {
    TextView mTextView;
    ImageView mImageView;

    public ImageViewHolder(View itemView) {
        super(itemView);
        mTextView = (TextView) itemView.findViewById(R.id.id_title);
        mImageView = (ImageView) itemView.findViewById(R.id.id_image);
    }
}
{% endhighlight %}

### 2. 重写getItemViewType方法

{% highlight Java %}
public int getItemViewType(int position) {
    return mItemList.get(position).getItemType();
}
{% endhighlight %}

### 3. 重写onCreateViewHolder方法

{% highlight Java %}
public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    if (viewType == Item.ITEM_TYPE.ITEM_TYPE_BUTTON.ordinal())
        return new ButtonViewHolder(mInflater.inflate(R.layout.button_item, parent, false));
    if (viewType == Item.ITEM_TYPE.ITEM_TYPE_IMAGE.ordinal()) {
        return new ImageViewHolder(mInflater.inflate(R.layout.image_item, parent, false));
    }
    return null;
}
{% endhighlight %}
需要对传入的`viewType`进行判断，返回不同类型的`ViewHolder`，`ViewHolder`的实例化方式与[RecylerView-1](recycler-view-1.md)中的相同。  

这里的`viewType`就是`getItemViewType`方法返回的值。


### 4. 重写onBindViewHolder方法

{% highlight Java %}
public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
    Item item = mItemList.get(position);

    if (holder instanceof ButtonViewHolder){
        ((ButtonViewHolder) holder).mButton.setText(item.getTitle());
    }else if (holder instanceof ImageViewHolder){
        ((ImageViewHolder) holder).mTextView.setText(item.getTitle());
        ((ImageViewHolder) holder).mImageView.setImageDrawable(item.getImage());
    }
}
{% endhighlight %}

需要对传入的`ViewHolder`对象进行判断，判断是`ButtonViewHolder`还是`ImageViewHolder`的实例，再根据不同情况进行`UI`的设定。

### 5. 效果
<img src="/screenshots/recycler-view-screen-3.png" width="250"/>



## 瀑布流

### 1. 效果
<img src="/screenshots/recycler-view-screen-4.png" width="250"/>

### 2. 利用StaggerLayoutManager
利用`StaggerLayoutManager`可以轻松地实现瀑布流效果。

{% highlight Java %}
mRecyclerView.setLayoutManager(new StaggerLayoutManager(3, StaggeredGridLayoutManager.VERTICAL));
{% endhighlight %}

参数代表沿垂直方向扩展，每行有`3`个`item`。

### 3. 修改高度
为了实现每个`item`的高度都不同，需要强制设定，但这在实际开发中是无须的，这里仅仅为了实现较好的视觉效果。  

在`ViewHolder`为每个`TextView`设定随机高度：

{% highlight Java %}
public class MyViewHolder extends RecyclerView.ViewHolder {
    TextView mTextView;

    public MyViewHolder(View itemView) {
        super(itemView);
        mTextView = (TextView) itemView.findViewById(R.id.id_text);
        ViewGroup.LayoutParams params = mTextView.getLayoutParams();
        params.height = (int) (200 + Math.random() * 200);
        mTextView.setLayoutParams(params);
    }
}
{% endhighlight %}
需要注意的是，不要在`onBindViewHolder`中设置随机高度，不然会出现**滑动过程`item`高度发生变化**的现象。

### 4. 添加监听器
当然，如果想要实现长按`item`删除的功能，也可以做到。  

在`onBindViewHolder`方法中：

{% highlight Java %}
public void onBindViewHolder(final MyViewHolder holder, final int position) {
    holder.mTextView.setText(data.get(position));
    holder.mTextView.setOnLongClickListener(new View.OnLongClickListener() {
        @Override
        public boolean onLongClick(View v) {
            int pos = holder.getLayoutPosition();       //do NOT use the parameter 'position' here
            notifyItemRemoved(pos);
            data.remove(pos);
            return false;
        }
    });
}
{% endhighlight %}

注意到使用`notifyItemRemoved()`即可删除特定位置的`item`，同时调用`remove()`方法删除数据源的相应数据。需要十分注意的是，这里的位置不能使用方法参数中的`position`，而需要由`holder.getLayoutPosition()`重新获得。官方的解释是这样的：

>For performance and animation reasons, RecyclerView batches all adapter updates until the next layout pass. This may cause mismatches between the Adapter position of the item and the position it had in the latest layout calculations.
>
>LayoutManagers should always call this method while doing calculations based on item positions. All methods in RecyclerView.LayoutManager, RecyclerView.State,  RecyclerView.Recycler that receive a position expect it to be the layout position of the item.

翻译过来就是：

>出于性能和动画的原因，RecyclerView 在下一个布局传递进来之前，批量完成了所有适配器的更新。这可能会导致item的适配器的位置和它在最新的布局计算的位置之间的失配。
>
>LayoutManager在做基于item位置的运算时，应该始终调用此方法。在RecyclerView.LayoutManager，RecyclerView.State，RecyclerView.Recycler所有方法中接收的位置必须是该项目的正确布局位置。


## 总结
`RecyclerView`玩年。

*关于`RecyclerView`监听器部分，请看[RecyclerView-3](recycler-view-3.html)，关于拖拽和滑动部分，请看[RecyclerView-4](recycler-view-4.html)*



