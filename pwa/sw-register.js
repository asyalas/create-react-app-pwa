// 将base64的applicationServerKey转换成UInt8Array
function urlBase64ToUint8Array (base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4)

  var base64 = (base64String + padding)
    /*  eslint-disable-next-line */
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  var rawData = window.atob(base64)
  var outputArray = new Uint8Array(rawData.length)
  for (var i = 0, max = rawData.length; i < max; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
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
if ('serviceWorker' in navigator) {
  //注册serviceWorker
  navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
    reg.onupdatefound = function () {
      var installingWorker = reg.installing
      installingWorker.onstatechange = function () {
        switch (installingWorker.state) {
          // case 'installed':
          case 'activated':
            //激活后，如果有更新，则提示用户
            if (navigator.serviceWorker.controller) {
              // window.dispatchEvent(new CustomEvent('sw.update'))
              let themeColor = document.querySelector('meta[name=theme-color]')
              let dom = document.createElement('div')
              themeColor && (themeColor.content = '#000')

              /* eslint-disable max-len */
              dom.innerHTML = `
                  <style>
                      .app-refresh{background:#000;height:0;line-height:52px;overflow:hidden;position:fixed;top:0;left:0;right:0;z-index:10001;padding:0 18px;transition:all .3s ease;-webkit-transition:all .3s ease;-moz-transition:all .3s ease;-o-transition:all .3s ease;}
                      .app-refresh-wrap{display:flex;color:#fff;font-size:15px;}
                      .app-refresh-wrap span{cursor: pointer;}
                      .app-refresh-wrap label{flex:1;}
                      .app-refresh-show{height:52px;}
                  </style>
                  <div class="app-refresh" id="app-refresh">
                      <div class="app-refresh-wrap" onclick="location.reload()">
                          <label>已更新最新版本</label>
                          <span>点击刷新</span>
                      </div>
                  </div>
              `
              /* eslint-enable max-len */

              document.body.appendChild(dom)
              setTimeout(() => {
                document.getElementById('app-refresh').className += ' app-refresh-show'
              })
            }
            break
        }
      }
    }
  }).catch(function (e) {
      console.error('Error during service worker registration:', e)
    })
  //监听serviceWorker通过postmessage传过来的信息
  navigator.serviceWorker.addEventListener('message', function (e) {
      var action = e.data;
      console.log(`receive post-message from sw, action is '${e.data}'`);
      switch (action) {
          case 'go-baidu':
              location.href = 'https://www.baidu.com';
              break;
          case 'go-github':
              location.href = 'https://github.com/asyalas/create-react-app-pwa';
              break;
          default:
              break;
      }
  });
  //获取服务器端的公钥
  fetch('/getKey').then(res => res.clone().json()).then(res => {
      if(res.isExit){
        console.log('[该网站已被注册]')
        return false
      }
      navigator.serviceWorker.ready.then(function (reg) {
        subscribe(reg, res.data)
      })
    }).catch(err => {
      console.log(err)
    })
   // 监控页面是否奔溃
  if (navigator.serviceWorker.controller !== null) {
    let HEARTBEAT_INTERVAL = 5 * 1000 // 每五秒发一次心跳
    let sessionId = Date.now()
    let heartbeat = function () {
      navigator.serviceWorker.controller.postMessage({
        type: 'heartbeat',
        id: sessionId,
        data: {
          p: location.pathname
        } // 附加信息，如果页面 crash，上报的附加数据
      })
    }
    window.addEventListener('beforeunload', function () {
      navigator.serviceWorker.controller.postMessage({
        type: 'unload',
        id: sessionId
      })
    })
    setInterval(heartbeat, HEARTBEAT_INTERVAL)
    heartbeat()
  }
}
