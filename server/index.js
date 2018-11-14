const express = require('express');
const fs = require('fs')
const app = express();
const webpush = require('web-push');
const {checkSubscription,readSubscription,writeSubscription ,resolveApp} =require('./utils')
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

/**
 * 基于PWA来做浏览器崩溃监测
 */
app.get('/crash',function(req,res,next){
	const data = JSON.parse(req.query.body)
    // debugger
    console.log(`网页${data.p}已崩溃`)
})

/**
 * 服务器缓存策略
 * ** */

const reponseHandle = (req,res,cacheHandle)=>{
    const filepath = resolveApp(`./static/${req.path}`)
    try {
        const stat = fs.statSync(filepath)
        const img = fs.readFileSync(filepath)
        res.set('Content-Type', 'image/jpeg');
        var isNpSend = cacheHandle(stat)
        //缓存策略
        !isNpSend && res.send(new Buffer(img));
    } catch (error) {
        console.log(error)
        res.statusCode = 404
          res.end('Not Found') 
    }
}

/**
 * Expires
 * http 1.0
 * **/ 
app.get('/1.jpg',function(req,res,next){
    reponseHandle(req,res,()=>{
        res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toUTCString())
    })
})

/**
 * cache-control
 * http 1.1
 * 优先级 ： cache-control > Expires
 * **/
app.get('/2.jpg',function(req,res,next){
    reponseHandle(req,res,()=>{
        res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toUTCString())
        res.setHeader('Cache-Control', 'max-age=20')
    })
})

/**
 * Last-Modified & if-modified-since
 * http 1.0
 * 如果断网的话，会有一定时间是直接读取缓存
 * **/
app.get('/3.jpg',function(req,res,next){
    reponseHandle(req,res,(stat)=>{
        let ifModifiedSince = req.headers['if-modified-since']
        let LastModified = stat.ctime.toGMTString()
        if(!!ifModifiedSince && LastModified === ifModifiedSince){
            res.statusCode = 304
            res.end()
            return true
        }
        if(!ifModifiedSince  || (!!ifModifiedSince && LastModified !== ifModifiedSince)){
            res.setHeader('Last-Modified', LastModified)
        }
        
    })
})
/**
 * ETag & If-None-Match
 * http 1.1
 * **/
app.get('/4.jpg',function(req,res,next){
    reponseHandle(req,res,(stat)=>{
        let ifNoneMatch = req.headers['if-none-match']
        let etag = '1212121212121212'
        if(!ifNoneMatch || (!!ifNoneMatch && ifNoneMatch!== etag)){
            res.setHeader('ETag', etag)
        }
        if(!!ifNoneMatch && ifNoneMatch === etag){
            res.statusCode = 304
            res.end()
            return true
        }
        
    })
})

/**
 * 监听3004
 * ** */
app.listen(3004,() => {
	console.log('app is running at: localhost:3004');
});





