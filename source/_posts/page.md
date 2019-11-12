---
title:  使用webhooks 在服务器自动部署hexo
date: 2019-11-10 19:27:13
tags: hexo 自动化部署
categorys: hexo
---


#  使用webhooks 在服务器自动部署hexo

### 1. 入口文件app.js 

```js
// 入口文件 app.js
const http = require('http');
const runHexo  = require('./runHexo');
const handler = require('./webhooks');

http.createServer((req, res) => {
    handler(req, res, err => {
        res.statusCode = 404;
        res.end('no such location')
    })
}).listen(3038);

runHexo();
```

### 2. runHexo.js 

```js
const { spawn } = require('child_process');

function runHexo() {
    // 跑hexo服务
    const child = spawn('hexo', ['server', '-p 80'])

    child.stdout.on('data', data => console.log(`stdout: ${data}`))

    child.stderr.on('data', data => console.log(`stderr: ${data}`))

    child.on('close', code => {
        console.log(`child process exited witdh code: ${code}`);
        runHexo();
    })
}

module.exports = runHexo;
```
主要是因为hexo没有入口文件跑程序，所以我们自己加一个。

### 3. webhooks 
首先你需要在github上对应的项目setting里面填写webhooks信息,如下图:
![img](../images/github.png)

ip和端口填服务器的ip和监听webhooks的端口

下面上代码：

```js
const handler = createHandler({path: '/webhook', secret: '******'});

// 这里是监听到git push 后的回调函数
function runGitShell(cmd, args, callback) {
    const gitChild = spawn(cmd, args);
    var response = '';
    gitChild.stdout.on('data', buffer => response += buffer.toString())
    gitChild.stderr.on('end', () => callback(response));
 }

handler.on('error', err => console.log(`Error: ${err}`))

handler.on('push', e => {
    console.log(`receoved a push event, ${e.payload.repository.name}`);
    runGitShell('sh', ['./deploy.sh'], (txt) => console.log(txt));
})
```