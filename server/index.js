const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
var webpush = require('web-push');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const pushSubscriptionPath = resolveApp('./server/pushSubscription.js')
const checkSubscription = ()=>{
    try {
        fs.readFileSync(pushSubscriptionPath,'utf-8')
        return true
    } catch (error) {
        return false
    }
}
// 静态文件托管
app.use(express.static('./dist'));

// 获取公钥接口
app.get('/getKey',function(req,res,next){
    const isExit = checkSubscription()
    if(!isExit){
        // 1.生成公私钥
        var vapidKeys = webpush.generateVAPIDKeys();
        // 2.设置公私钥
        webpush.setVapidDetails( 
            'mailto:sender@example.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );
    }
    console.log(`${isExit?'[该网站已被注册]':'[发送推送公钥]'}`)
    res.send({
        data:vapidKeys,
        isExit
    })
})

//保存订阅的推送对象
//这里只是简单的实现，生产中请保存在数据库中
app.get('/save',function(req,res,next){
    fs.writeFile(pushSubscriptionPath, req.query.body,  function(err) {
        if (err) {
            return console.error('推送注册失败',err);
        }
        console.log('[推送注册成功]')
    });
   
})

//向订阅的浏览器发送消息
app.get('/push',function(req,res,next){

    const pushSubscription = fs.readFileSync(pushSubscriptionPath,'utf-8')
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

app.listen(3005,() => {
	console.log('app is running at: localhost:3005');
});





