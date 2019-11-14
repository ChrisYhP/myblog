---
title: '[译]编写通用Catch装饰器,更好地处理ES/Typescript类异常'
date: 2019-11-14 20:26:06
tags: ['javascript', '异常处理', '翻译']
categorys: '前端'
---
&emsp;&emsp;
一般而言，错误处理在Javascript里面并不是一个很复杂的主题，但是当不同的错误出现在应用里面，让应用崩溃，留下一脸困惑的用户时却非常有用...

&emsp;&emsp;
如果你想保护程序免受可能的错误的影响，你可以为这些错误写一部分代码，如果错误发生，处理他们并且发生一些提示语给用户。

&emsp;&emsp;
这些都可以使用try/catch代码块或者Promise对象的.catch方法来处理，到目前为止还不错。在这篇文章里，我们将深入地将Javascript应用错误处理理论知识付诸实践。下面让我们开始吧。

&emsp;&emsp;
这篇文章假设javascript有一个合适的背景。

&emsp;&emsp;
接下来所有的示例都将作为典型的错误处理案例，在Vue Class Components中展示，但是他们也能在任何的ES/Typescript类中使用。

&emsp;&emsp;
继续...

&emsp;&emsp;
大部分关于Vue components的错误处理教程(这些错误通常被处理成“Toast”message给用户)都是类似下面示例的实现

```js
@Component
class LoginPage extends Vue {
    async loginUser() {
        try {
            const token = await api.loginUser(this.email, this.password)
            handleLogin(token)
        } catch(error) {
            Toast.error(error.message)
        }
    }
}
```

上面的实现方案是正确的，看起来不错。
