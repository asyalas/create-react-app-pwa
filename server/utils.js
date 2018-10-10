
/**
 * 此文件模拟了一个订阅对象在数据库的存储过程，生产环境请使用数据库
 * **/

const fs = require('fs')
const path = require('path')

/**
 * 获取订阅对象的路径
 * **/
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const pushSubscriptionPath = resolveApp('./server/pushSubscription.js')

/**
 * 检查订阅对象是否存在
 * **/
const checkSubscription = ()=>{
  try {
    fs.statSync(pushSubscriptionPath)
    fs.readFileSync(pushSubscriptionPath,'utf-8')
    return true
  } catch (error) {
    return false
  }
    
}

/**
 * 读取订阅对象的内容
 * **/  
const readSubscription = ()=>{
  try {
    const data = fs.readFileSync(pushSubscriptionPath,'utf-8');
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
 }

 /**
  * 写入订阅对象内容
  * **/

  const writeSubscription =(userData)=> {
    try {
      fs.writeFileSync(pushSubscriptionPath, JSON.stringify(userData))
      return true
    } catch (error) {
      return false
    }
  }

  module.exports = {
    pushSubscriptionPath,
    checkSubscription,
    readSubscription,
    writeSubscription
  }