---
layout: post
title: Android MVVM
date: 2016-11-10 16:20:05 +0800
categories: [coding, android, designframework]
permalink: /:categories/:title
---

## Misunderstanding
We all know that `Data-binding` mechanism is something about, however, it's not `MVVM` all about but just a tool to help us implement `MVVM` on `Android`.

So, `Data-binding` is not simply binding data to the `View`, it focuses on the `MVVM` framework, which means you are supposed to take care of your project architecture on purpose.

## Model
Actually, the `Model` here is not simply the one to store data we talked about. What we store data is called `Entity`, and `Model` is more like something to interact with `Entity`. But to be exact `Entity` is affiliated to `Model` in a way.

Like here, I make an `Entity` named `Repo`:

{% highlight Java %}
public class Repo {
    @SerializedName("name")
    private String name;
    @SerializedName("description")
    private String description;
    @SerializedName("fork")
    private boolean fork;

	//setters and getters
	...
}
{% endhighlight %}
The annotation in the code snippet is part of the `GsonConverter` system.

Meanwhile, I make a `Model` named `RepoModel` (extends the Entity usually):

{% highlight Java %}
public class RepoModel extends Repo {
    public boolean isForked(){
        return getFork();
    }
}
{% endhighlight %}
Generally speaking, some of the business logics are implemeted in the `Model`.

## ViewModel
As its name tells, `ViewModel` is the agency to communicate `Model` and `View`, and at the meantime decouple them.

Show the code first.

{% highlight Java %}
public class RepoViewModel {
    private ObservableField<String> name;
    private ObservableField<String> description;

    public RepoViewModel() {
        name = new ObservableField<>("");
        description = new ObservableField<>("");
    }

    public void setRepo(Repo repo) {
        name.set(repo.getName());
        description.set(repo.getDescription());
    }
    
    //getters
    ...
}
{% endhighlight %}
As we can see, the memeber variables in the `ViewModel` have corresponding variables in `Model(Entity)`. In a way, the variables in `ViewModel` are temporary and sensitive while the ones in `Model` are relatively stable and not often to change (But it will change if they need to, of course).

The variables in `ViewModel` is directly the ones showing or is going to show on UI.

## View
The `View` here is different from the one in `MVC` and `MVP`. Since it working with `Data-binding` mechanism, it need to use `<layout>`, `<data>`, `<variable>` and so on in `layout.xml`. For more about it, you can visit my another post [Data-binding](/coding/android/databinding/data-binding-1-en.html).