---
layout: post
title: Android MVP
date: 2016-11-08 16:20:05 +0800
categories: [coding, android, designframework]
permalink: /:categories/:title
index: 9
---

## Preface

As we mention in [MVC/MVP/MVVM](MVC-MVP-MVVM.html), `MVP` has fixed many problems in `MVC`.

* `MVP` decouples the `View` and `Controller`.
* Logics about UI and business are extracted to the `Presenter`, making it easier to read the code.
* `Presenter` is based on Interface, making it much more flexible and convienient to do unit test.
* The resources in `Activity` can be recycled to avoid memory leak and OOM.

## Example

### Preview

I'll make an example with a login activity, just like the one below.

<img src="/screenshots/android-mvp.png" width="250"/>

### Architecture

<img src="/screenshots/android-mvp-architecture.png" width="500"/>

*(This sketch is from [segmentfault.com](https://segmentfault.com/a/1190000003927200).)*

We build up an `Interface` named `ILoginPresenter`, which stands for the basic `Presenter`. 

Then we create a class `LoginPresenterImpl` to implement the `ILoginPresenter`. Its construction method must have an argument `ILoginView`, which is a actually an `Interface` stands for the basic `View`. 

And in fact, `Activity` is class to implement the `ILoginView`, which means the `LoginPresenterImpl` keeps a reference to the `Activity`.

### ILoginPresenter

Here I implement some basic functionalities, like clearing an `EditText`, checking the user name and password.

{% highlight Java %}
public interface ILoginPresenter {
    void clear(View v);
    void doLogin(String userName, String pwd);
    void setProgressBarVisibility(int visibility);
}
{% endhighlight %}

### ILoginView

I need to implement some methods that can be called when the corresponding methods in `LoginPresenterImpl` are invoked.

{% highlight Java %}
public interface ILoginView {
    void onClearText(View v);
    void onResult(boolean pass);
    void onSetProgressBarVisibility(int visibility);
}
{% endhighlight %}

### LoginPresenterImpl

`LoginPresenterImpl` is a class to implement `ILoginPresenter`.

{% highlight Java %}
public class LoginPresenterImpl implements ILoginPresenter {
    private ILoginView mLoginView;
    private Handler handler;

    public LoginPresenterImpl(ILoginView loginView) {
        mLoginView = loginView;
        handler = new Handler();
    }

    @Override
    public void clear(View v) {
        mLoginView.onClearText(v);
    }

    @Override
    public void doLogin(final String userName, final String pwd) {
        mLoginView.onSetProgressBarVisibility(View.VISIBLE);
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                boolean pass = userName.equals(Constant.USER_NAME) && pwd.equals(Constant.PASSWORD);
                mLoginView.onResult(pass);
                mLoginView.onSetProgressBarVisibility(View.GONE);
            }
        }, 2000);
    }

    @Override
    public void setProgressBarVisibility(int visibility) {
        mLoginView.onSetProgressBarVisibility(visibility);
    }
}
{% endhighlight %}

As we can see, inside methods, the methods of `ILoginView` are called. `Handler` is used here just to make delay on purpose.

### Activity

To be exact, the `Activity` is a `LoginViewImpl`.

{% highlight Java %}
public class MVPActivity extends AppCompatActivity implements ILoginView, View.OnClickListener {
    private LoginPresenterImpl mPresenter;
    private Button mButtonLogin, mButtonClear;
    private EditText mEditTextUserName, mEditTextPassword;
    private ProgressBar mProgressBar;
    mPresenter = new LoginPresenterImpl(this);

    @Override
    public void onClearText(View v) {
        if (v.getId() == R.id.btn_clear) {
            mEditTextPassword.setText("");
            mEditTextUserName.setText("");
        }
    }

    @Override
    public void onResult(boolean pass) {
        Toast.makeText(this, pass ? "success" : "fail", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onSetProgressBarVisibility(int visibility) {
        mProgressBar.setVisibility(visibility);
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_login:
                mPresenter.doLogin(mEditTextUserName.getText().toString(), mEditTextPassword.getText().toString());
                break;
            case R.id.btn_clear:
                mPresenter.clear(v);
                break;
        }
    }
}
{% endhighlight %}

Inside the methods implemented by `MVPActivity`, we do the work.

Now, the `Presenter` is commucating with `View(Activity)` and `Model` and `View` is totally separated. Since we don't have `Model` here, I am not able to show more about it.

Hope you have a better understanding of `MVP` in Android development.