---
layout: post
title: OkHttp+GithubApi
date: 2016-10-26 16:20:05 +0800
categories: [coding, android, httpclient]
permalink: /:categories/:title
index: 3
---


This post introduces how to use [Github-Api](https://developer.github.com/v3/) and how to fetch data with [Okhttp](https://github.com/square/okhttp), decode data in json with [Gson](https://github.com/google/gson)and display items with [RecyclerView](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.html).

And oh, of course all I do is based on `Android`.

## Fetch data
With `Github-Api`, it's simple to get information from [Github.com](https://github.com). Here I fetch profile of my github account, and information of all my repos.  

From [this guide](https://developer.github.com/v3/repos/#list-user-repositories), we know that using:

{% highlight shell %}
GET https://api.github.com/users/:username/repos
{% endhighlight %} 
can list someone's repos. 
 
Using `OkHttp` makes it much easier.  
The code fragment below is what I do with `OkHttp` to get results:
 
{% highlight Java %}
private final String REPO_USER_PREFIX = "https://api.github.com/users/";
private final String REPO_USER_POSTFIX = "/repos?sort=created";  //get the repos sorted by created date

//with this url, we can get the information of all repos of specific user.
String url = REPO_USER_PREFIX + userName + REPO_USER_POSTFIX;

final Request request = new Request.Builder().url(url).build();
mOkHttpClient.newCall(request).enqueue(new Callback() {
	@Override
	public void onFailure(Call call, IOException e) {}

	@Override
	public void onResponse(Call call, Response response) throws IOException {
		if(response.isSuccessful())
			System.out.println(response.body().string());
	}
}
{% endhighlight %}
 
 Ok, now I get the repos of mine, and the results come back in format of `Json` like:
 
{% highlight Json %}
[
  {
    "id": 64843937,
    "name": "Algorithm",
    "full_name": "Mindjet/Algorithm",
    "owner": {
      "login": "Mindjet",
      "id": 17674741,
      ...
    },
    "private": false,
    "description": "some practises from nowcoder.com and leetcode.com",
    "fork": false,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "Java",
    "forks": 0,
    "watchers": 0
    ...
  },
    {
    "id": 65451339,
    "name": "android-open-project",
    "full_name": "Mindjet/android-open-project",
    "owner": {
      "login": "Mindjet",
      "id": 17674741,
      ...
    },
    "private": false,
    "description": "some practises from nowcoder.com and leetcode.com",
    "fork": false,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "Java",
    "forks": 0,
    "watchers": 0
    ...
  },
  ...
]
{% endhighlight %}


## Decode data
Next, we are gonna decode the `Json` to `POJO`.

`Gson` can help us do this, but first of all we need to implement a `Java Object` consists of the member variables we need. A `Java Object` stores information of a repo.

Let's make a `Java Object` named `RepoInfo`:

{% highlight Java %}
public class RepoInfo {
    @SerializedName("name") public String repoName = null;
    public String description = null;
    @SerializedName("fork") public boolean isForked = false;
    @SerializedName("language") public String codeLang = null;
    @SerializedName("forks_count") public int forkCount = 0;    
    @SerializedName("stargazers_count") public int StarCount = 0;
}
{% endhighlight %}

Do remember to use annotation `@SerializedName` wherever your variable name is not the same as the key name in the `Json`.

After this, the `Json` can be easily transfer to `Java Object` using `Gson` like this:

{% highlight Java %}
Gson mGson = new Gson();
List<RepoInfo> mRepoInfoList = mGson.fromJson(response.body().string(), new TypeToken<List<RepoInfo>>() {}.getType());
{% endhighlight %}
The decode operation is supposed to be done in a worker thread, like in `onResponse` method.

Now we get what we want.

## Display data
`RecyclerView` is an excellent view that can display items perfectly. You can visit [another post (RecyclerView)](https://github.com/Mindjet/Way2Android/blob/master/recycler-view-1.md) to see how to use it. (The post is in Chinese.)


## Screenshot

<img src="/screenshots/github-api.png" width="280"/>

Oh you may ask that how can I get the profile of a specific user like the first item in the picture.

You can get it by:

{% highlight shell %}
GET https://api.github.com/users/:username
{% endhighlight %}

The result still comes back in `Json`, I am sure that you can decode the it and display it just in the same way I do above.

## Source code
You can get the source code from my repo [NetworkThirdPartyLib](https://github.com/Mindjet/NetworkThirdPartyLib).

The code about this post is mainly in `GithubActivity.java` and `GithubAdapter.java`.

