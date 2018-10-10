
const webpush = require('web-push');

const {readSubscription} =require('./utils')

const userData =readSubscription()
// 2.设置公私钥
webpush.setVapidDetails( 
  'mailto:sender@example.com',
  userData.publicKey,
  userData.privateKey
);
    if(userData.pushSubscription){
        webpush.sendNotification(userData.pushSubscription,JSON.stringify({
            body:'PWA推送demo',
            image:'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=947246226,3592380246&fm=26&gp=0.jpg'
        }),{} )
        .then(data=>{
            console.log('[推送成功]')
        }).catch(function (err) {
            console.log('[推送失败]',err)
            if (err.statusCode === 410 || err.statusCode === 404) {
                // 从数据库中删除推送订阅对象
            }
        });
    }