---
layout: post
title: Data-binding-2
date: 2016-10-17 16:20:05 +0800
categories: [coding, android, databinding]
permalink: /:categories/:title
index: 4
---

## 回顾
在[data-binding-1](data-binding-1-cn.html)中，只是实现了`xml`文件对`JavaBean`的读取，并没有体现`MVVM`设计模式的所有内容。

`Data-binding`最有意思的地方是，当改变`JavaBean`数据时，修改能够实时地体现在 UI 上。而我们这次要做的就是这件事。


## 修改实体类
我们之前的实体类是这样的：

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
为控件设置点击事件，在点击事件中修改 User 实例的成员变量，会发现虽然实例中的数据确实变了，但是在 UI 上并没有体现出来。

有一种做法是让`User`继承`BaseObservable`，但是该方法麻烦而且代码量大，不作介绍。

另一种较好的做法是，使每个成员变量都是一个`ObservableField`类，此类继承了`BaseObservable`并且实现了`Serializable`接口。

此时，`User`类变为：

{% highlight Java %}
public class User extends BaseObservable {
    public ObservableField<String> name = new ObservableField<>();
    public ObservableField<Integer> color = new ObservableField<>();
    public ObservableField<String> age = new ObservableField<>();

    public User(String age, int color, String name) {
        this.name.set(name);
        this.age.set(age);
        this.color.set(color);
    }
}
{% endhighlight %}
可以看见，代码极其简洁，不用设置`setter/getter`。需要注意的是，需要为每个变量**实例化**。成员变量以下面的方式赋值和获取：

{% highlight Java %}
user.name.set("xxxx");
String name = user.name.get();
{% endhighlight %}

## 在点击（或其他）事件中改变数据
如在按钮的点击事件中改变`user`的`name`值，`TextView`即随之更新。

{% highlight Java %}
user.name.set(String.valueOf(Math.random() * 100));
{% endhighlight %}

## 总结
通过`demo`可以知道，使用`data-binding`直接省去了：

- 为控件设置`id`  

- 使用`findViewById`实例化`view` 

- 使用`setText`等语句更新 UI
