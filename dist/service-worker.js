importScripts("/precache-manifest.16b18a1595fee6f23b159b61206f3262.js", "/workbox-v3.6.2/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "/workbox-v3.6.2"});


//监听push事件
self.addEventListener('push', function (e) {
  var data = e.data
  if (e.data) {
    try {
      data = data.json()
    } catch (error) {
      data = data.text()
    }
    console.log('push的数据为：', data)
    //浏览器推送api
    self.registration.showNotification('来自PWA的推送',{
      //不会自动消失
      requireInteraction: true,
      //推送小图标
      icon:'/favicon.ico',
      badge: '/favicon.ico',
      //推送预览图片
      //推送内容
      ...data,
      //推送的震动
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
      //推送的按钮
      actions: [
        {
            action: 'go-baidu',
            title: '去百度',
            icon: '/favicon.ico'
        },
        {
            action: 'go-github',
            title: '去github',
            icon: '/favicon.ico'
        }
      ]
    })
  } else {
    console.log('push没有任何数据')
  }
})
//监听推送被点击事件
self.addEventListener('notificationclick', event => {
  switch (event.action) {
      case 'go-baidu':
          console.log('点击了去百度按钮');
          break;
      case 'go-github':
          console.log('点击了去github按钮');
          break;
      default:
          console.log(`Unknown action clicked: '${event.action}'`);
          break;
  }
  event.notification.close();
  event.waitUntil(
    // 获取所有clients
    self.clients.matchAll().then(function (clients) {
      if (!clients || clients.length === 0) {
        // 当不存在client时，打开该网站
        self.clients.openWindow && self.clients.openWindow(' localhost:3004');
        return;
      }
      // 切换到该站点的tab
      console.log('[clients]',clients)
      clients[0].focus && clients[0].focus();
      clients.forEach(function (client) {
      // 使用postMessage进行通信
          client.postMessage(event.action);
      });
    })

  )
});

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

/**
* example runningCache with api
*/
// workbox.routing.registerRoute(/^https:\/\/lavas\.baidu\.com\/some\/api/,
//     workbox.strategies.networkFirst());

/**
* example runningCache with resources from CDN
* including maxAge, maxEntries
* cacheableResponse is important for CDN
*/
// workbox.routing.registerRoute(/^https:\/\/cdn\.baidu\.com/i,
//     workbox.strategies.cacheFirst({
//         cacheName: 'lavas-cache-images',
//         plugins: [
//             new workbox.expiration.Plugin({
//                 maxEntries: 100,
//                 maxAgeSeconds: 7 * 24 * 60 * 60
//             }),
//             new workbox.cacheableResponse.Plugin({
//                 statuses: [0, 200]
//             })
//         ]
//     })
// );

