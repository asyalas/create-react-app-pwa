importScripts("/precache-manifest.16b18a1595fee6f23b159b61206f3262.js", "/workbox-v3.6.2/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "/workbox-v3.6.2"});

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
    self.registration.showNotification(data)
  } else {
    console.log('push没有任何数据')
  }
})

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

