---
layout: post
title: Data-binding-1(中文)
date: 2016-10-14 16:20:05 +0800
categories: [coding, android, databinding]
permalink: /:categories/:title
index: 1
---

[Switch to English version](data-binding-1-en.html)

>The Data Binding Library offers both flexibility and broad compatibility — it's a support library, so you can use it with all Android platform versions back to Android 2.1 (API level 7+). 

## 简介  
  
　　Data-binding-library 是 Google 公司出品的第三方开源库。其最大的一个特点是在布局文件 xml 中引入变量和 Java 类，这些变量可以用 Java 代码定义，使布局十分灵活和方便。  
　　若深究一些，则可以发现 data-binding 机制是使用了`MVVM`设计模式。 MVVM 即 Model-View-ViewModel ， ViewModel 的数据变化，直接会在 View 上面体现出来。


## 导入
　　基于 Andoird Studio 开发，则在 module 所属的`build.gradle`文件中加入：  

{% highlight Gradle %}
android{
	xxx
	...
	dataBinding{
		enable = true
	}
}
{% endhighlight %}

　　另外，需要在项目的`build.gradle`中加入：

{% highlight Gradle %}
dependencies{
	...
	classpath 'com.android.databinding:dataBinder:1.0-rc0'
}
{% endhighlight %}


## 使用

 - **例子1：简单的显示  JavaBean 内容**

　　假设我们有实体类`User`，其中有两个字符串成员变量`name`和`age`。使用 data-binding ，需要为实体类设置`getter`。
  
{% highlight Java %}
public class User {
    private String name;
    private String age;

    public User(String age, String name) {
        this.age = age;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getAge() {
        return age;
    }
}
{% endhighlight %}

　　对于 layout 文件，最外层的节点必须为`<layout></layout>`，在其中通过`<data>`标签引入 variable ，或者使用`import`导入系统自带的类。  
　　而在控件中，利用`@{bean.xxx}`则可以直接引入数据。
  
{% highlight XML %}
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android">
    <data>
        <variable
            name="user"
            type="com.mindjet.data_binding_sample.User"/>
    </data>

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:gravity="center"
        android:orientation="horizontal">
        <TextView
            android:id="@+id/tv_name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{user.name}"/>
    </LinearLayout>
</layout>

{% endhighlight %}

　　对于使用了`<layout>`节点的 xml 布局文件， databinding 会自动为其生成`Binding`类，如此处的 activity_main.xml 则生成 ActivityMainBinding.java ，利用该类可以实现数据的绑定。

{% highlight Java %}
ActivityMainBinding mBinding = DataBindingUtil.setContentView(R.layout.activity_main);
User user = new User("21","Mindjet");
mBinding.setUser(user);
{% endhighlight %}

 - **例子2： ListView 与 Data-binding**  
  
  
　　 ListView 使用 databinding 可以起到跟`ViewHolder`一样的 view 复用的效果。  
  
  
　　 ListView 需要用到 Adapter ，这里自定义一个继承于`BaseAdapter`的`MyBindingAdapter`。  

　　在布局文件中，需要引入`MyBindingAdapter`和`User`:

{% highlight XML %}
<data>
    <variable
        name="user"
        type="com.mindjet.data_binding_sample.User"/>

    <variable
        name="adapter"
        type="com.mindjet.data_binding_sample.MyBindingAdapter"/>
</data>
{% endhighlight %}

　　在控件中加入数据：

{% highlight XML %}
<TextView  
     android:id="@+id/tv_name"  
     android:layout_width="wrap_content"  
     android:layout_height="wrap_content"  
     android:onClick="@{adapter.onclickListener}" 
     android:text="@{user.name}"/>
{% endhighlight %}

　　注意到 onClick 事件也可以通过 databinding 来绑定。

　　回到`MyBindingAdapter`中，主要是`getView`方法：

{% highlight Java %}
public View getView(int position, View convertView, ViewGroup parent) {
    if (convertView == null) {
        mBinding = DataBindingUtil.inflate(mInflater, R.layout.listviewitem_binding, parent, false);
        convertView = mBinding.getRoot();
        convertView.setTag(mBinding);
    } else {
        mBinding = (ListviewitemBindingBinding) convertView.getTag();
    }

    mBinding.setVariable(com.mindjet.data_binding_sample.BR.user, mUserList.get(position));
    mBinding.setAdapter(this);
    return convertView;
}
{% endhighlight %}

　　其中，`mBinding`是根据 xml 布局文件生成的 Binding 类，通过 DataBindingUtil 的`inflate`方法可以返回该对象，将该对象与 xml 布局文件绑定起来。  
　　注意到，当 convertView 为空时，需要绑定，并且通过 Binding 对象的`getRoot`方法可以返回 convertView 。  
　　为 variable 赋值时，有两种做法，一种是`setVariable`通过`BR`类设置，另外一种是直接通过像`setAdapter`一样的方式设置。

　　可以看到，完全不需要用 ViewHolder 。

　　我们利用`@{adapter.onclickListener}`为控件设置监听器，意味着在 MyBindingAdapter 中需要有一个监听器成员变量：

{% highlight Java %}
public class MyOnclickListener implements View.OnClickListener{
    @Override
    public void onClick(View v) {
        TextView tv = (TextView) v;
        System.out.println(tv.getText());
    }
}
{% endhighlight %}

　　注意，监听器类的访问权限须为`public`，因为在 Binding 类中会直接引用该类。同时需要实例化出该 onclickListener 并且编写`getOnclickListener`方法。


[下一篇data-binding的文章(关于UI实时变化)](data-binding-2.html)

