---
layout: post
title: Data-binding-1-en
date: 2016-10-14 16:20:05 +0800
categories: [coding, android, databinding]
---

[切换到中文版](data-binding-1-cn.html)

>The Data Binding Library offers both flexibility and broad compatibility — it's a support library, so you can use it with all Android platform versions back to Android 2.1 (API level 7+). 

## Introduction  
  
`Data-binding-library` is a third party open source library created by `Google Inc.`.  
  
Simply speaking, the most attractive highlight is introducing `Java` class and variables defined by `Java` code in `xml` layout files, which makes it pretty fexible to maintain your layouts. 
  
If dig it deeper，you will find that the design patter called `MVVM` is inside the `data-binding` mechanism. `MVVM`, `Model-View-ViewModel`, it automatically updates the `View` whenever the `ViewModel` changes.


## Import
Based on `Andoird Studio`, you are supposed to add couple of lines in the `build.gradle` of your `module`:

{% highlight Gradle %}
android{
	xxx
	...
	dataBinding{
		enable = true
	}
}
{% endhighlight %}
Meanwhile, add lines below to the `build.gradle` of your project:

{% highlight Gradle %}
dependencies{
	...
	classpath 'com.android.databinding:dataBinder:1.0-rc0'
}
{% endhighlight %}

## Samples

 - **Ex 1：Display contents in `JavaBean`**

Assuming that we have a `Java Bean` named `User`, which includes 2 String variables, `name` and `age`. Before using `data-binding`, do remember to add `getter` for each variable.(Or you can simply make the variable public.)
  
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

As for the `xml` layout file，the name of the outermost node must be `<layout></layout>`, you can introduce `variable` using `<data>` tag, or import class using `import` tag.  
　　And for widget, using `@{bean.xxx}` can introduce the data.
  
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


`Data-binding` mechanism will automatically generate `Binding` class for every `xml` file that has a `<layout>` tag. For example, here my `xml` file is named `activity_main`,  correspondingly, a `Binding` class named `ActivityMainBinding` will be generated. 


With this class, we can implement the binding


{% highlight Java %}
ActivityMainBinding mBinding = DataBindingUtil.setContentView(R.layout.activity_main);
User user = new User("21","Mindjet");
mBinding.setUser(user);
{% endhighlight %}

Now you can run your app and see what happen.


 - **Ex 2：`ListView`&`Data-binding`**  
  
  
Applying `data-binding` on `ListView` can reuse `view` just like the `ViewHolder` does.
  
  
Here I defined a `MyBindingAdapter` extending `BaseAdapter`.  

In the layout file, I introduce the `MyBindingAdapter`和`User` just like below:

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
And bind the data to widget:

{% highlight XML %}
<TextView  
     android:id="@+id/tv_name"  
     android:layout_width="wrap_content"  
     android:layout_height="wrap_content"  
     android:onClick="@{adapter.onclickListener}" 
     android:text="@{user.name}"/>
{% endhighlight %}
You can see that `onClick` can also be bound to a widget by using `data-binding`.

Let's go back to `MyBindingAdapter` and check the method `getView`:

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
`mBinding` is a auto-generated class. Using the method `inflate` of `DataBindingUtil` can bind the `xml` to the `mBinding` and return it.

Note that when the `convertView` is null, we should do the binding and using `Binding`'s method `getRoot` can return a `convertView` it binds.

When it comes to the assignment of `variable`, there are 2 ways to go. You can assign the variable using `setVariable` and a class named `BR`, or just explicitly set the value just like method `setAdapter`.

We have no need to introduce `ViewHolder` with `data-binding`.(The truth is `data-binding` has done it for us.)

If we use `@{adapter.onclickListener}` to attach listener to a widget, we need a Listener as a member variable in `MyBindingAdapter`:

{% highlight Java %}
public class MyOnclickListener implements View.OnClickListener{
    @Override
    public void onClick(View v) {
        TextView tv = (TextView) v;
        System.out.println(tv.getText());
    }
}
{% endhighlight %}
Attention, the modifier must be `public`, because the `Binding` class will directly use this class. At the meantime, you need to instantiate `MyOnclickListener` and add a `getter` for it.
