---
title: 使用Node.js构建微服务
date: 2019-12-03 10:29:06
tags: ['Nodejs', '微服务', '翻译']
---

### [译]使用Node.js构建微服务
原文地址: <https://medium.com/@maciejtreder/building-javascript-microservices-with-node-js-d88bf0bb2b92>

当你的Javascript应用越来越庞大，你开始面临维护代码、修复Bug、新增新功能等挑战。同样的，在项目中加入新的开发者也变得复杂。

应用构建碎片化，比如packages和modules, 但是在某种程度上那些结构不足以减少项目体积以及复杂度。分布式系统背后的想法是把大型设计改成小的、独立的程序，这些程序可以互相通信交换数据以及执行操作。

微服务架构就是分布式系统的变异体之一，它把应用程序构造成松散耦合的服务集合。这些服务是细粒度的，通信协议也非常轻量。

相对于单体架构，微服务和分布式服务的优越性值得一提：

+ 模块化 —— 将特定的操作分给应用程序的各个部分
+ 一致性 —— 微服务接口由一个基础的URI和标准的HTTP方法(GET,POST,PUT,PATCH,DELETE)组成。
+ 健壮性 —— 组件故障只会导致特定单元功能的缺失或减少。
+ 可维护性 —— 系统组件可以单独修改和部署。
+ 可扩展性 —— 可以添加或者移除服务来响应需求变化。
+ 有效性 —— 可以向系统添加新特性，同时保持100%可用性。
+ 可测试性 —— 

除此之外，每个微服务都可以使用最适合任务的语言，技术或者框架来编写。唯一必要的特性是发布用于与其他服务通信的RESTful APIs能力。

在这篇文章里，你将通过构建一个由2个Nodejs服务构成的基础系统，学习到如何构建微服务。

### 使用Nodejs构建微服务架构需要的条件

为了完成文章中的任务，你需要完成这些东西：
+ 安装Node.js和npm
  
为了从文章中最有效的学习，你需要掌握下列知识：
+ 有使用Javascript和Node.js经验
+ 对HTTP协议有一些了解

[这篇文章在github上配套的库](https://github.com/maciejtreder/introduction-to-microservices/tree/master/heroes)

### 创建heroes service
进入你想创建项目的文件夹下，创建下面的文件夹和文件:
```js
./heroes/heroes.js
./heroes/img/
```

这是一个好的初始化仓库的时机，如果你想使用代码管理工具的话。如果你使用git，不要忘了添加一个.gitignore文件。

在./heroes文件夹下初始化npm，然后执行下列命令，安装依赖。
```js
npm init -y
npm install express body-parser
```

是时候完成服务了。复制下面Javascript代码到./heroes/heroes.js里面:

```js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.argv.slice(2)[0];
const app = express();
app.use(bodyParser.json());
const powers = [
  { id: 1, name: 'flying' },
  { id: 2, name: 'teleporting' },
  { id: 3, name: 'super strength' },
  { id: 4, name: 'clairvoyance'},
  { id: 5, name: 'mind reading' }
];
const heroes = [
  {
      id: 1,
      type: 'spider-dog',
      displayName: 'Cooper',
      powers: [1, 4],
      img: 'cooper.jpg',
      busy: false
  },
  {
      id: 2,
      type: 'flying-dogs',
      displayName: 'Jack & Buddy',
      powers: [2, 5],
      img: 'jack_buddy.jpg',
      busy: false
  },
  {
      id: 3,
      type: 'dark-light-side',
      displayName: 'Max & Charlie',
      powers: [3, 2],
      img: 'max_charlie.jpg',
      busy: false
  },
  {
      id: 4,
      type: 'captain-dog',
      displayName: 'Rocky',
      powers: [1, 5],
      img: 'rocky.jpg',
      busy: false
  }
];
app.get('/heroes', (req, res) => {
  console.log('Returning heroes list');
  res.send(heroes);
});
app.get('/powers', (req, res) => {
  console.log('Returning powers list');
  res.send(powers);
});
app.post('/hero/**', (req, res) => {
  const heroId = parseInt(req.params[0]);
  const foundHero = heroes.find(subject => subject.id === heroId);
  if (foundHero) {
      for (let attribute in foundHero) {
          if (req.body[attribute]) {
              foundHero[attribute] = req.body[attribute];
              console.log(`Set ${attribute} to ${req.body[attribute]} in hero: ${heroId}`);
          }
      }
      res.status(202).header({Location: `http://localhost:${port}/hero/${foundHero.id}`}).send(foundHero);
  } else {
      console.log(`Hero not found.`);
      res.status(404).send();
  }
});
app.use('/img', express.static(path.join(__dirname,'img')));
console.log(`Heroes service listening on port ${port}`);
app.listen(port);
```
从下列链接下载superhero和superhero团队的图片，放到/heroes/img文件夹下:
+ [cooper.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step1/heroes/img/cooper.jpg)
+ [jack_buddy.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step1/heroes/img/jack_buddy.jpg)
+ [max_charlie.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step1/heroes/img/max_charlie.jpg)
+ [rocky.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step1/heroes/img/rocky.jpg)

heroes服务的代码提供:
+ heroes super powers 列表
+ heroes列表
+ 获取heroes列表，更新hero详情，获取hero图片的接口

### 测试heroes.js服务
heroes服务里面的下列代码能够让你跑任何端口的服务：
```js
const port = process.argv.slice(2)[0];
...
app.listen(port);
```
代码里面的省略号是为了方便理解去掉的部分。

执行下面命令，启动服务：
```js
node ./heroes/heroes.js 8081
```

你可以使用Postman、curl、PowerShell、或者浏览器来测试服务是否按预期工作，curl命令是：
```js
curl -i --request GET localhost:8081/heroes
```

如果服务正常工作，你应该能在console输出面板看到下面类似的信息:
```js
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 424
ETag: W/"1a8-BIZzoIRo/ZugcWv+LFVGSU1qIZU"
Date: Thu, 04 Apr 2019 12:07:07 GMT
Connection: keep-alive
[{"id":1,"type":"spider-dog","displayName":"Cooper","powers":[1,4],"img":"cooper.jpg","busy":false},{"id":2,"type":"flying-dogs","displayName":"Jack & Buddy","powers":[2,5],"img":"jack_buddy.jpg","busy":false},{"id":3,"type":"dark-light-side","displayName":"Max & Charlie","powers":[3,2],"img":"max_charlie.jpg","busy":false},{"id":4,"type":"captain-dog","displayName":"Rocky","powers":[1,5],"img":"rocky.jpg","busy":false}]
```
在Postman里面的返回结果应该是这样:
[]

如果你想通过github仓库来学习这部分的话，在你想创建项目的文件夹下执行下面命令:
```js
git clone https://github.com/maciejtreder/introduction-to-microservices.git
cd introduction-to-microservices/heroes
git checkout step1
npm install
```

### 创建threats服务

如果没有危险，那么超级英雄存在的意义是什么？我们应用程序的微服务架构使用了一个单独的服务来应对只有superhero能够处理的挑战。它提供一个API让superheros来应对威胁。

创建threats服务的过程与创建heroes的服务相似。

在项目文件夹根目录下创建下列文件夹和文件:
```js
./threats/threats.js
./threats/img/
```
在./threats目录下，初始化项目、安装依赖:
```js
npm init -y
npm install express body-parser request
```
将这些Javascript代码粘贴到./threats/threats.js文件中:
```js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const port = process.argv.slice(2)[0];
const app = express();
app.use(bodyParser.json());
const heroesService = 'http://localhost:8081';
const threats = [
  {
      id: 1,
      displayName: 'Pisa tower is about to collapse.',
      necessaryPowers: ['flying'],
      img: 'tower.jpg',
      assignedHero: 0
  },
  {
      id: 2,
      displayName: 'Engineer is going to clean up server-room.',
      necessaryPowers: ['teleporting'],
      img: 'mess.jpg',
      assignedHero: 0
  },
  {
      id: 3,
      displayName: 'John will not understand the joke',
      necessaryPowers: ['clairvoyance'],
      img: 'joke.jpg',
      assignedHero: 0
  }
];
app.get('/threats', (req, res) => {
  console.log('Returning threats list');
  res.send(threats);
});
app.post('/assignment', (req, res) => {
  request.post({
      headers: {'content-type': 'application/json'},
      url: `${heroesService}/hero/${req.body.heroId}`,
      body: `{
          "busy": true
      }`
  }, (err, heroResponse, body) => {
      if (!err) {
          const threatId = parseInt(req.body.threatId);
          const threat = threats.find(subject => subject.id === threatId);
          threat.assignedHero = req.body.heroId;
          res.status(202).send(threat);
      } else {
          res.status(400).send({problem: `Hero Service responded with issue ${err}`});
      }
  });
});
app.use('/img', express.static(path.join(__dirname,'img')));
console.log(`Threats service listening on port ${port}`);
app.listen(port);
```

你可以从下面的链接下载图片，然后放到/threats/img文件夹中:
+ [tower.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step2/threats/img/tower.jpg)
+ [mess.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step2/threats/img/mess.jpg)
+ [joke.jpg](https://raw.githubusercontent.com/maciejtreder/introduction-to-microservices/step2/threats/img/joke.png)
  
除了threats列表和列出他们的基础方法，这个服务也有POST方法，/assignment, 让hero处理threat  
```js
app.post('/assignment', (req, res) => {
   request.post({
       headers: {'content-type': 'application/json'},
       url: `${heroesService}/hero/${req.body.heroId}`,
       body: `{
           "busy": true
       }`
   }, (err, heroResponse, body) => {
       if (!err) {
           const threat = threats.find(subject => subject.id === req.body.threatId);
           threat.assignedHero = req.body.heroId;
           res.status(202).send(threat);
       } else {
           res.status(400).send({problem: `Hero Service responded with issue ${err}`});
       }
   });
});
```
程序需要知道heroes服务的地址，因为这些代码执行了服务内部通信。如果你要改变运行heroes的服务端口，你需要编辑这一行:
```js
const heroesService = 'http://localhost:8081';
```

### 测试threats service
如果你关闭了heroes服务，或者关闭了终端窗口，那么重启它。
打开另一个终端窗口，支持下面的命令，启动threats服务。
```js
node threats/threats.js 8082
```
用测试heroes服务的方法来测试threats服务, 使用Postman,curl,Powershell或者浏览器发送一个web请求。注意这次是一个POST请求。

curl命令如下: 
```js
curl -i --request POST --header "Content-Type: application/json" --data '{"heroId": 1, "threatId": 1}' localhost:8082/assignment
```
如果服务工作正常，你应该能在console面板看到类似下面的输出内容:
```js
HTTP/1.1 202 Accepted
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 121
ETag: W/"79-ER1WRPW1305+Eomgfjq/A/Cgkp8"
Date: Thu, 04 Apr 2019 19:32:56 GMT
Connection: keep-alive
{"id":1,"displayName":"Pisa tower is about to collapse.","necessaryPowers":["flying"],"img":"tower.jpg","assignedHero":1}
```
Postman返回的内容如下:
[]
在heroes启动的终端窗口中，你应该能看到:
```js
Heroes service listening on port 8081
Set busy to true in hero: 1
```
你刚刚派Cooper去执行一个任务...
[img]
...飞往比萨，拯救历史古迹。
[img]
你可以使用hero和threats图片来探索你自己的服务的功能。这些对象也将在即将发布的文章中成为该项目的一部分，该文章以此项目为起点。

如果你想使用github仓库代码来学习这部分，执行下面的
