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
  navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
    reg.onupdatefound = function () {
      var installingWorker = reg.installing
      installingWorker.onstatechange = function () {
        console.log('[PWA的生命周期]',installingWorker.state)
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
  })
    .catch(function (e) {
      console.error('Error during service worker registration:', e)
    })
  //获取服务器端的公钥
fetch('/getKey').then(res => {
    return res.clone().json()
  }).then(res => {
    if(res.isExit){
      console.log('[该网站已被注册]')
      return false
    }
    navigator.serviceWorker.ready.then(function (reg) {
      subscribe(reg, res.data.publicKey)
    })
  }).catch(err => {
    console.log(err)
  })
}
