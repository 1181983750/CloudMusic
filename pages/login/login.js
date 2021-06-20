// pages/login/login.js
/**
  作者: Created by zhiyongzaixian
  说明: 登录流程
  1. 收集表单项数据
  2. 前端验证
    1) 验证用户信息(账号，密码)是否合法
    2) 前端验证不通过就提示用户，不需要发请求给后端
    3) 前端验证通过了，发请求(携带账号, 密码)给服务器端
  3. 后端验证
    1) 验证用户是否存在
    2) 用户不存在直接返回，告诉前端用户不存在
    3) 用户存在需要验证密码是否正确
    4) 密码不正确返回给前端提示密码不正确
    5) 密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
*/
import request from '../../utils/request';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',    //手机号
    password: ''   //用户密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //定义的方法 表单内容发生改变时回调
  handleInput(e) {
    let type = e.currentTarget.id;  //取值：phone || password
    // console.log(type, e.detail.value);
    this.setData({
      [type]: e.detail.value
    })
  },

  //登录的 异步回调
  async login() {
    //1.收集表单项数据
    let { phone, password } = this.data;
    //2.验证
    /* 手机号验证：
      1) 验证用户是否存在
      2) 用户不存在直接返回，告诉前端用户不存在
      3) 用户存在需要验证密码是否正确
      4) 密码不正确返回给前端提示密码不正确
      5) 密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
    */
    //  wx.showToas() 是个异步任务所以运行接受得返回值结束回调
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'error',
        duration: 1200
      })
      return;
    }
    let phoneReg = /^1(3|4|5|7|8|9)\d{9}$/; //验证规则
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式不对',
        icon: 'error',
        duration: 1200
      })
      return;
    }

    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 800
      })
      return;
    }
    //end 前端格式验证通过
    //start 后端api接口验证登录
    let result = await request('/login/cellphone', { phone, password,isLogin:true}); //网易云音乐手机登录接口   设置一个isLogin参数判断是否为登录请求
    
    if (result.code === 200) {
      // console.log(result);
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 500
      }),
      /*参数  本地存储setStorageSync(key,data)
      string key  自定义名字
      本地缓存中指定的 key 键名
      
      any data
      需要存储的内容。只支持原生类型、Date、及能够通过***JSON.stringify()***序列化的对象。
     */
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))
      setTimeout(function(){
        wx.switchTab({
          url:'/pages/personal/personnal'
        })
      },1000)
     
      return result;
    } else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'error',
        duration: 800
      })
    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'error',
        duration: 800
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: 'error',
        duration: 800
      })
    }
  },
  // 跳转至二维码登录
  toCodeLogin(){
    wx.navigateTo({
      url: '/pages/codeLogin/codeLogin',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})