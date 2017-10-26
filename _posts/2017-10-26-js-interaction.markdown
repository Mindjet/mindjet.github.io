---
layout: post
title: Android 与 Javascript 的交互
date:  2017-10-26 17:21:05 +0800
categories: [coding, android]
permalink: /:categories/:title
index: 1
---

*文中 Android 端代码均用 Kotlin*

>
> WebView 是两者沟通的桥梁。
>

## Android 调用 Js 代码

此处为了简单，直接使用了本地 `assets` 文件夹中的 `html`，`css` 和 `javascript` 文件了。

Android 这边需要对 `WebView` 做一些设置：（Kotlin 语法）

{%highlight kotlin%}
with(webView.settings) {
    @SuppressLint("SetJavaScriptEnabled")
    javaScriptEnabled = true
    javaScriptCanOpenWindowsAutomatically = true
}
{%endhighlight%}

同时在 Js 那边定义将被调用的方法：

{%highlight js%}
const fun4android = () => {
    alert('Android 调用了 Js 的方法了,666');
}
{%endhighlight%}

然后在 Android 这边加载网页：

{%highlight kotlin%}
webView.loadUrl("file:///android_asset/index.html")	//注意是 asset，不是assets
{%endhighlight%}

然后就可以调用 Js 的方法了：

{%highlight kotlin%}
webView.post { webView.loadUrl("javascript:fun4android()") } //需要在UI线程执行
{%endhighlight%}



但是，上面这种方法较为死板，而且无法获取 Js 方法的返回值，我们需要用到另一个方法：

{%highlight kotlin%}
webView.evaluateJavascript("xxx()", (String) -> Unit)
{%endhighlight%}

所以我们在 Js 再添加一个有返回值的方法：

{%highlight js%}
const getString = () => {
    return "A string from Js";
}
{%endhighlight%}

然后在 Android 这边调用：

{%highlight kotlin%}
webView.evaluateJavascript("getString()") { Toasty.toast(context, it) }
{%endhighlight%}



## Js 调用 Android 代码

首先要在 Android 编写通信接口：

{%highlight kotlin%}
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun toast(string: String) {
        Toasty.toast(context, string)
    }
}, "xxx")
{%endhighlight%}

其中，第一个参数是一个 Object 对象，其中定义了即将被 Js 调用的方法，方法需要用 `@JavascriptInterface` 来注解表面是 Js 通信接口；第二个参数是这个 Object 暴露在 Js 中的名字。

然后 Js 那边就可以简单地调用了：

{%highlight js%}
window.xxx.toast("Js 调用了 Android 的方法了，666"); //xxx是刚刚在 Android 中定义的对象名
{%endhighlight%}



## Android 拦截 Js

在第一个例子中，在 Android 中调用了 Js 的代码 `alert`，这个方法会使页面弹出一个 alert 弹窗，我们可以拦截这种行为，不要显示页端的弹窗，而显示 Android 原生的弹窗（因为可定制性强）。

这种拦截能力，可以通过为 WebView 添加 `WebChromeClient` 来实现：

{%highlight kotlin%}
webView.webChromeClient = MyWebChromeClient()

private inner class MyWebChromeClient : WebChromeClient() {
    override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
        AlertDialog.Builder(context)
                .setTitle("Alert")
                .setIcon(R.drawable.ic_launcher_background)
                .setMessage("$url:$message")
                .setCancelable(false)
                .setPositiveButton("OK", { dialog, _ ->
                    dialog.dismiss()
                    result?.confirm()
                })
                .create()
                .show()
        return true
    }
}
{%endhighlight%}

可见，在 `onJsAlert` 方法中，我们实现了自己的 Dialog。需要注意的是，返回 `true` 说明该行为 Js 已经不用处理了，Android 这边已经处理妥当， 反之亦然。

同时，需要调用 `result.confirm()`，去告诉 Js 已经确认处理了，不然页面将陷入一片空白。基于此，我们也需要将弹窗设为不可点击弹窗外区域隐藏，避免没有调用 `result.confirm()`。
