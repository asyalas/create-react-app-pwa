const express = require('express');
const app = express();
const webpush = require('web-push');
const {checkSubscription,readSubscription,writeSubscription} =require('./utils')
// 静态文件托管
app.use(express.static('./dist'));
// 1.生成公私钥
var vapidKeys = webpush.generateVAPIDKeys();
// 检测是否已订阅，模拟数据库，则拉出对应的公私钥
const isExit = checkSubscription()
if(isExit){
    vapidKeys = readSubscription()
}
// 2.设置公私钥
webpush.setVapidDetails( 
    'mailto:sender@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
// 获取公钥接口
app.get('/getKey',function(req,res,next){
    res.send({
        data:vapidKeys.publicKey,
        isExit
    })
})

//保存订阅的推送对象
//这里只是简单的实现，生产中请保存在数据库中
app.get('/save',function(req,res,next){
    const userData = {
        pushSubscription:JSON.parse(req.query.body),
        ...vapidKeys
    }
    writeSubscription(userData)
})

//向订阅的浏览器发送消息
app.get('/push',function(req,res,next){

    const userData =readSubscription()
    console.log('[准备推送]')
    if(userData.pushSubscription){
        webpush.sendNotification(userData.pushSubscription,JSON.stringify({
            body:'PWA推送demo',
            image:'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=947246226,3592380246&fm=26&gp=0.jpg'
        }),{} )
        .then(data=>{
            console.log('[推送成功]')
            res.send({code:1})
        }).catch(function (err) {
            console.log('[推送失败]',err)
            if (err.statusCode === 410 || err.statusCode === 404) {
                // 从数据库中删除推送订阅对象
            }

            res.send({code:-1})
        });
    }else{
        console.log('[推送失败],请先订阅')
        res.send({code:-1})
    }
  
});

app.listen(3004,() => {
	console.log('app is running at: localhost:3004');
});





