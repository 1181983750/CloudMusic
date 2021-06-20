//发送ajax请求

/*                              封装全部功能函数库

1:歌曲搜索接口
请求地址:https://autumnfish.cn/search
请求方法:get
请求参数:keywords(查询关键字)
响应内容:歌曲搜索结果

2:歌曲url获取接口
请求地址:https://autumnfish.cn/song/url
请求方法:get
请求参数:id(歌曲id)
响应内容:歌曲url地址
3.歌曲详情获取
请求地址:https://autumnfish.cn/song/detail
请求方法:get
请求参数:ids(歌曲id)
响应内容:歌曲详情(包括封面信息)
4.热门评论获取
请求地址:https://autumnfish.cn/comment/hot?type=0
请求方法:get
请求参数:id(歌曲id,地址中的type固定为0)
响应内容:歌曲的热门评论
5.mv地址获取
请求地址:https://autumnfish.cn/mv/url
请求方法:get
请求参数:id(mvid,为0表示没有mv)
响应内容:mv的地址
*/
import config from '../utils/config';

export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) => {    //封装一个promise方法 来执行异步任务
        wx.request({    
            url:config.host+url, //导入config.js中的接口地址+返回的参数接口
            data,
            method,
            header:{
                //判断本地存储取得的cookies数据里有无MUSIC_U字符串  item取得的值下标不能为-1 
                // cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
                cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.includes("MUSIC_U") !==false ): ''
            },
            success: (response) => {
                if(data.isLogin){   //判断是否为登录的请求
                    wx.setStorage({
                      key: 'cookies',    //key 自定义的字段名
                      data: response.cookies   
                    })
                }
                console.log('请求成功:', response);
                resolve(response.data);
            },
            fail: (error) => {
                // console.log('请求失败：', error);
                reject(error);
            }
        })
    })
}