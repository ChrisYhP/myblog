---
title: '[译]编写通用Catch装饰器,更好地处理ES/Typescript类异常'
date: 2019-11-14 20:26:06
tags: ['javascript', '异常处理', '翻译']
categorys: '前端'
---

  一般而言，错误处理在Javascript里面并不是一个很复杂的主题，但是当不同的错误出现在应用里面，让应用崩溃，留下一脸困惑的用户时却非常有用...

  如果你想保护程序免受可能的错误的影响，你可以为这些错误写一部分代码，如果错误发生，处理他们并且发生一些提示语给用户。

这些都可以使用try/catch代码块或者Promise对象的.catch方法来处理，到目前为止还不错。在这篇文章里，我们将深入地将Javascript应用错误处理理论知识付诸实践。下面让我们开始吧。

这篇文章假设javascript有一个合适的背景。

接下来所有的示例都将作为典型的错误处理案例，在Vue Class Components中展示，但是他们也能在任何的ES/Typescript类中使用。

继续...

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

+ 我们发起请求，等待response(token)
+ 如果没有错误 -> 处理response
+ 如果在loginUser里面捕捉到error -> 进入catch代码块处理错误。
  
一切看起来都很简单。

但是当我们的应用变得更复杂，它包含很多API请求和其他能够抛出错误的代码时会发生什么?
好吧，他们看起来像这样:

```js
@Component
class App extends Vue {
  // ...
  decodeData(data) {
    try {
      this.decodedData = atob(data) // can throw DOMException
    } catch(error) {
      Toast.error(error.message)
    }
  }
  async getData() {
    try {
      this.data = await api.getData() // can throw Error
    } catch(error) {
      Toast.error(error.message)
    }
  }
}
```
```js
@Component
class LoginPage extends Vue {
  // ...
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
如你所见，很多try/catch代码块让本来漂亮的代码变得丑陋，重复。

最好让你的代码更具有声明行，描述你的程序必须要完成的工作，而不是如何完成。

所以我们应该隐藏try/catch逻辑，在我们的Vue app中找到一个更优雅的处理错误的方案。下面让我们试试吧。

### Vue instruments

如果你打开Vue的文档，你可以找到一个errorHandler的全局选项属性，可以将未捕获的异常处理程序分给它。这对我们来说应该是一个完美的选择，让我们试试。

```js
// main.js
Vue.config.errorHandler = function (error) {
  Toast.error(error.message)
  console.warn(error.message)
}

// App.vue
@Component
export default class App extends Vue {
  async created() {
    const data = await api.getData() // throws Error
    // ...
  }
  
  mounted() {
    this.name = this.name.toUpperCase() // throws TypeError
  }
}
```
太棒了！我们移除了丑陋的try/catch代码块，将处理异常的程序写到全局的errorHandler方法中了，让我们启动App:

![img](/images/error.png)

Hmmm...mounted里面的error被捕获到了，但是created里面的没有。原因是errorHandler不能捕捉一步方法里的异常。Vue内部将created方法作为同步函数运行，没有等待可能抛出异常的异步操作完成。

继续...

### Let`s catch
在查资料时，我偶然发现一些Java代码，然后看到了一些有意思的错误处理，仅Java支持:

```java
class Main {
    public static void main(String[] args) throws IOException {
        FileReader file = new FileReader("C:\\test\\a.txt");
        // ...
    }
}
```

这里的IOException告诉编译器在这个方法中有一些错误可能被抛出，应该被处理。在我们的案例中使用类似的方案应该会很棒！

然而Javascript没有让我们实施这种功能的原生机制。是的...但是我们有装饰器啊！

装饰器是一种编程模式，下面你们可以看看他的一种实现方式:
```js
function log(func) {
  return function() {
    func()
    console.log('Function called')
  }
}

function getData() { ... }

getData = log(getData)
getData() // in console: Function called
```
对于第一次听说装饰器的人来说，上面示例中的方法log就是一个装饰器。它将getData方法作为一个参数并且使用logging功能扩展了后者的功能。

装饰器是一种结构设计模式，通过将新行为放置在包含这些行为的包装对象中，您可以将其附加到对象。

但是Javascript有它自己的装饰器实现方案，一个包含@前置标识的方法，紧跟着class,参数，方法或者属性:

```js
// register global handler
catchDecorator.register((error) => Toast.error(error.message))

@Component
class LoginPage extends Vue {
  // ...
  // catch errors and run global handler
  @Catch()
  async loginUser() {
    const token = await api.loginUser(this.email, this.password)
    handleLogin(token)
  }
}
```
这里的@Catch注解是我们的装饰器。让我们完成它吧。根据ES6标准，一个装饰器是一个返回方法的表达式，可以作为参数。

+ target ——— class, 是decorator真正被用到的地方;
+ name ———— method/property decorator被运用的名字
+ property descriptor ———— 描述属性的特定对象

基础的decorator
```js
function Catch(target, key, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
        try {
            return await originalMethod.apply(this, args)
        } catch (error) {
            console.warn(error.message)
            Toast.error(error.message)
        }
    }

    return descriptor
}

export default Catch
```
首先，我们将descriptor的值保存在originalMethod。然后用我们的目标函数重写原来的值，在此我们使用包装函数中的参数运行原始方法。

我们使用apply方法来链接方法和原始上下文(this)。调用包裹着try/catch代码块的原始方法，展示任何的异常，最后，抛出descriptor。

在component里使用我们的通用decorator:

```js
import Catch from './catchDecorator'

@Component
export default class App extends Vue {
  @Catch
  async created() {
    const data = await api.getData() // throws Error
  }
  
  @Catch
  mounted() {
    this.name = this.name.toUpperCase() // throws TypeError
  }
}
```

启动App：

![img](/images/catch.png)

它起作用了！现在同步和异步的错误都被正确的处理了，这些仅仅需要一个注解。
你也可以使用在常规的Promise,它也可以:
```js
@Component
export default class App extends Vue {
  @Catch
  created() {
    return api.getData() // throws Error
      .then(data => ...) 
  }
}
```
现在我们的decorator有一个异常处理程序，但这个方案扩展性不是太好。所以，我们需要创建一个可以注册通用处理程序的store，让decorator可以调用这个处理程序:
```js
export const catchDecoratorStore = {
    handler: null,
    setHandler(handler) {
        this.handler = handler
    }
}

function Catch(target, key, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
        try {
            return await originalMethod.apply(this, args)
        } catch (error) {
            const { handler } = catchDecoratorStore

            if (handler && typeof handler === 'function') 
                return handler()

            console.warn(error.message) // default handler
        }
    }

    return descriptor
}

export default Catch
```
这里我们创建了一个带有setHandler方法的catchDecoratorStore对象，该方法将handler赋值给handler属性。然后在cactch代码块中检查handler是否存在，如果存在则调用它，否则展示默认console信息。

现在我们可以使用它，跟使用Vue全局error handler非常的相似。
```js
import Catch, { catchDecoratorStore } from './catchDecorator'

catchDecoratorStore.setHandler(error => Toast.error(error.message))

@Component
export default class App extends Vue {
  @Catch
  async created() {
    const data = await api.getData() // throws Error
    // ...
  }
}
```
快结束了。它现在是一个很完整的解决方案了，你可以使用decorator处理任何的方法，event handler和生命周期函数。

但是，如果有一些方法需要一个独立的错误处理逻辑呢？这种情况下我们需要为decorator添加一个额外的功能——接收参数的能力，为了像这样使用它：@Catch(handler)

更新后的版本:
```js
function Catch(localHandler) {
    return function(target, key, descriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function(...args) {
            try {
                return await originalMethod.apply(this, args)
            } catch (error) {
                const { handler } = catchDecoratorStore
                
                if (localHandler) {
                    localHandler.call(null, error, this)
                } else if(handler) {
                    handler.call(null, error, this)
                } else {
                    console.warn(error.message)
                }
            }
        }
        return descriptor
    }
}
```


