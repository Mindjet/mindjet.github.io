---
layout: post
title: RecyclerView-3 (监听器)
date: 2016-10-20 12:20:05 +0800
categories: [coding, android, recyclerview]
permalink: /:categories/:title
index: 9
---

对`RecyclerView`更多的内容，请看[RecyclerView-1](recycler-view-1.html)和[RecyclerView-2](recycler-view-2.html)。

这里主要讲`RecyclerView`的监听器。

## 定义监听器接口
为了保证`RecyclerViewAdapter`的解耦性，此处将监听器接口定义在适配器的外部。

```java
public interface onItemClickListener {
    void onNormalClickListener(View view, String string, int position);
    void onLongClickListener(View view, String string, int position);
}
```
接口中实现了**普通点击**和**长按**两种点击事件，实现多少种类型看个人需求。


## 监听器实例化
在`adapter`内部，维护一个`onItemClickListener`类型的全局变量`mOnItemClickListener`，并为其设置`setter`：

```java
private ListenerActivity.onItemClickListener mOnItemClickListener;
public void setOnItemClickListener(ListenerActivity.onItemClickListener onItemClickListener) {
    mOnItemClickListener = onItemClickListener;
}
```

同时，在外部重写监听器的内部方法，并把监听器通过`setter`设置给`adapter`：

```java
final ListenerAdapter adapter = new ListenerAdapter(data, this);
adapter.setOnItemClickListener(new onItemClickListener() {
    @Override
    public void onNormalClickListener(View view, String string, int position) {
        Log.d("ListenerActivity", "position = " + position + ", content = " + string);
    }

    @Override
    public void onLongClickListener(View view, String string, int position) {
        adapter.notifyItemRemoved(position);
        adapter.data.remove(position);
    }
});

mRecyclerView.setAdapter(adapter);
```
在`onNormalClickListener`方法中`log`出被点击`view`的信息，而在`onLongClickListener`方法中删除被点击的`item`。

## 监听器绑定
`adapter`需要实现`View.onClickListener`和`View.onLongClickListener`方法：

```java
public class ListenerAdapter extends RecyclerView.Adapter<ListenerAdapter.TextViewHolder> implements View.OnClickListener, View.OnLongClickListener 
```

在`adapter`的`onCreateViewHolder`方法中，为`view`绑定监听器：

```java
public TextViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    View view = mInflater.inflate(R.layout.text_item, parent, false);
    view.setOnClickListener(this);
    view.setOnLongClickListener(this);
    return new TextViewHolder(view);
}
```

## 数据与view绑定
在点击事件中，唯一传入的参数是`view`。如`onclick(View v)`，如果想获取该`view`的更多信息，需要将对应的`holder`绑定到`view`上。

```java
public void onBindViewHolder(TextViewHolder holder, int position) {
    holder.mTextView.setText(data.get(position));
    holder.itemView.setTag(holder);
}
```

## 点击事件中调用接口方法
`adapter`实现了`View.onClickListener`和`View.onLongClickListener`接口，需要重写接口的两个方法`onClick`和`onLongClick`，在这两个方法中调用自定义接口`onItemClickListener`中对应的方法：

```java
@Override
public void onClick(View v) {
    if (mOnItemClickListener != null) {
        TextViewHolder holder = (TextViewHolder) v.getTag();
        mOnItemClickListener.onNormalClickListener(v, holder.mTextView.getText().toString(), holder.getLayoutPosition());
    }
}

@Override
public boolean onLongClick(View v) {
    if (mOnItemClickListener != null) {
        TextViewHolder holder = (TextViewHolder) v.getTag();
        mOnItemClickListener.onLongClickListener(v, holder.mTextView.getText().toString(), holder.getLayoutPosition());
    }
    return true;
}
```

注意到，可以使用`view.getTag()`方法获得对应的`holder`，而通过`holder`的`getLayoutPosition()`等又可以获得更多信息。

同时，需要考虑`onLongClick`方法的返回值，返回为`true`说明点击事件被`onLongClick`消费掉，不会引起其他点击事件；若返回`false`，则`onLongClick`方法没有消费点击事件，在手指抬起时会触发`onClick`方法。

## 总结
虽然`RecyclerView`本事不提供`onItemClickListener`接口，但是通过自己实现能够实现更多自定义功能。


*关于`RecyclerView`拖拽和滑动部分，请看[RecyclerView-4](recycler-view-4.html)。*