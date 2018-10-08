## create-react-app-pwa

### 前文
Progressive Web App, 简称 PWA，是提升 Web App 的体验的一种新方法，能给用户原生应用的体验。 create-react-app在2.0版本后，自动加上了对server worker的配置，本项目是基于create-react-app2.0版本的增强，添加了推送功能，修改了缓存策略以及增加了web app的兼容和配置。

### 传送门
[create-react-app](https://github.com/facebook/create-react-app)
[PWA中文文档](https://lavas.baidu.com/pwa)
[workbox](https://developers.google.com/web/tools/workbox/)
[Service Worker的兼容性](https://caniuse.com/#search=service%20worker)

### 开始

 ```js
 npm i
 npm run pwa
 ```
### PWA的前提条件

- 要求 HTTPS 的环境，本地调试支持host为localhost 或者 127.0.0.1
- Service Worker 的缓存机制是依赖 Cache API 实现的
- 依赖 HTML5 fetch API，PWA可以拦截请求且发送请求
- 依赖 Promise 实现,链式调用

### PWA生命周期

![avatar](https://gss0.bdstatic.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/pwa/projects/1515680651546/sw-lifecycle.png)

生命周期分为这么几个状态 安装中, 安装后, 激活中, 激活后, 废弃，通过onstatechange来监听状态进行dom操作及其他。

### PWA Event
![avatar](https://gss0.bdstatic.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/pwa/projects/1515680651547/sw-events.png)

在sw注册时添加监听事件，此时上下文不在window上，不能进行dom操作
