importScripts("/precache-manifest.43b8108ff3750cbe29c403ed43b70533.js", "/workbox-v3.6.2/workbox-sw.js");
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

// 监控网页是否崩溃
const CHECK_CRASH_INTERVAL = 10 * 1000 // 每 10s 检查一次
const CRASH_THRESHOLD = 15 * 1000 // 15s 超过15s没有心跳则认为已经 crash
const pages = {}
let timer
function checkCrash () {
  const now = Date.now()
  for (var id in pages) {
    let page = pages[id]
    if ((now - page.t) > CRASH_THRESHOLD) {
      fetch(`/crash?body=${JSON.stringify(page)}`)
    }
  }
  if (Object.keys(pages).length === 0) {
    clearInterval(timer)
    timer = null
  }
}
self.addEventListener('message', (e) => {
  const data = e.data
  switch (data.type) {
    case 'heartbeat':
      pages[data.id] = {
        t: Date.now(),
        ...data.data
      }
      if (!timer) {
        timer = setInterval(function () {
          checkCrash()
        }, CHECK_CRASH_INTERVAL)
      };break
    case 'unload': delete pages[data.id]; break
    default:break
  }
})
