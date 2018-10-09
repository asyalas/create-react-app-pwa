## create-react-app-pwa

### 前文
Progressive Web App, 简称 PWA，是提升 Web App 的体验的一种新方法，能给用户原生应用的体验。 create-react-app在2.0版本后，自动加上了对server worker的配置，本项目是基于create-react-app2.0版本的增强，添加了推送功能，修改了缓存策略以及增加了web app的兼容和配置。

### 传送门
- [create-react-app](https://github.com/facebook/create-react-app)
- [PWA中文文档](https://lavas.baidu.com/pwa)
- [workbox](https://developers.google.com/web/tools/workbox/)
- [Service Worker的兼容性](https://caniuse.com/#search=service%20worker)

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

### 基本用法

- 注册

```js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
    reg.onupdatefound = function () {
      var installingWorker = reg.installing
      installingWorker.onstatechange = function () {
        switch (installingWorker.state) {
          //监听当前状态
          case 'installed':; break
          case 'activating':; break
          case 'activated':; break
        }
      }
    }
  })
    .catch(function (e) {
      console.error('Error during service worker registration:', e)
    })
```

- 监听

```js
  self.addEventListener('install', function () {
      self.skipWaiting();
  });
  self.addEventListener('activate', function (e) {
    
  });
  self.addEventListener('fetch', function (e) {
    
  });
  self.addEventListener('push', function (e) {
    
  });
```

- 缓存

```js
// 监听 service worker 的 install 事件，初始缓存
this.addEventListener('install', function (event) {
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open('my-test-cache-v1').then(function (cache) {
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll([
                '/',
                '/index.html',
                '/main.css',
                '/main.js',
                '/image.jpg'
            ]);
        })
    );
});
// 监听 service worker 的 fetch 事件,拦截fetch请求,缓存资源
this.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 来来来，代理可以搞一些代理的事情

            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open('my-test-cache-v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
  });
  // 自动更新缓存
  // 监听 service worker 的 install 事件,安装阶段跳过等待，直接进入 active
  self.addEventListener('install', function (event) {
      event.waitUntil(self.skipWaiting());
  });
  // 监听 service worker 的 activate 事件,更新客户端,清理旧版本
  self.addEventListener('activate', function (event) {
      event.waitUntil(
          Promise.all([

              // 更新客户端
              self.clients.claim(),

              // 清理旧版本
              caches.keys().then(function (cacheList) {
                  return Promise.all(
                      cacheList.map(function (cacheName) {
                          if (cacheName !== 'my-test-cache-v1') {
                              return caches.delete(cacheName);
                          }
                      })
                  );
              })
          ])
      );
  });
```
也可以直接用谷歌提供的workbox的库里做缓存策略,可以通过谷歌提供的webpack插件workbox-webpack-plugin来自动注入
```js
/* globals workbox */
  workbox.core.setCacheNameDetails({
    prefix: 'pwa',
    suffix: 'v1',
    precache: 'install-time',
    runtime: 'run-time',
    googleAnalytics: 'ga'
  })

  workbox.skipWaiting()
  workbox.clientsClaim()
  // 设置缓存都数组，默认为[]
  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  workbox.precaching.suppressWarnings()
  // 设置需要缓存的url，默认为__precacheManifest文件里的数组
  workbox.precaching.precacheAndRoute(self.__precacheManifest || [])
```
- 推送
  - 服务端基于web-push生成公私钥
  ```js
        // server/index.js
        var webpush = require('web-push');
        // 1.生成公私钥
        var vapidKeys = webpush.generateVAPIDKeys();
        // 2.设置公私钥
        webpush.setVapidDetails( 
            'mailto:sender@example.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );
  ```

  - 客户端请求对应的公钥，注册订阅推送，并将生成的订阅对象传回服务端存入数据库

  ```js
    // src/sw-register.js
    //订阅pwa推送
    function subscribe (serviceWorkerReg, publicKey) {
      // 询问用户是否要订阅消息
      serviceWorkerReg.pushManager.subscribe({ // 2. 订阅
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })
        .then(function (subscription) {
          fetch(`/save?body=${JSON.stringify(subscription)}`)
            .then((res) => {
              console.log(res)
            })
        })
        .catch(function () {
          if (Notification.permission === 'denied') {
            // 用户拒绝了订阅请求
          }
        })
      }
  ```
  - 当有推送请求的时候，取出数据库的订阅对象，发送推送
  ```js
  //向订阅的浏览器发送消息
    app.get('/push',function(req,res,next){
        // pushSubscription 从数据库取出 
        console.log('[准备推送]',pushSubscription)
        if(pushSubscription){
            webpush.sendNotification(JSON.parse(pushSubscription),'推送demo',{} )
            .then(data=>{
                console.log('[ 推送成功 ]',JSON.stringify(data))
            }).catch(function (err) {
                console.log('[推送失败]',err)
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // 从数据库中删除推送订阅对象
                }
            });
        }
      
    });
  ```
