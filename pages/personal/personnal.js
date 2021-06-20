import request from '../../utils/request'

// pages/personal/personnal.js
var startY = 0; //手指起始坐标
var moveY = 0;  //手指移动坐标
var moveOut = 0; //手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clickLoginInfo: 'clickLoginInfo',
    coverTransform: 'translateY(0)', //初始位置
    coverTransition: '',
    userInfo: {}, //保存用户信息
    recentPlayList: [],//用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取本地存储的用户信息回调
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo);
    if (userInfo) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      // removeEventListener(clickLoginInfo)
      this.setData({
        userInfo: JSON.parse(userInfo),
        clickLoginInfo: ''
      })
      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },

  //用户点击退出登录
  outLogin() {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('recentPlayList')
    let reStorage = this.setData({
      userInfo:'',
      recentPlayList:'',
      clickLoginInfo:'clickLoginInfo'
    })
    let out = request('/logout')
    if (reStorage == null) {
      wx.showToast({
        title: '退出成功',
        icon: 'success',
        duration: 800
      })
    }
  },

  //用户播放记录函数
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record', { uid: userId, type: 1 })
    let index = 0;
    let recentPlayList = recentPlayListData.weekData.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList: recentPlayList
    })
  },
  //移动卡片
  handleTouchStart(e) {
    startY = parseInt(e.touches[0].clientY) //记录第一个手指Y坐标
    // console.log(startY);
    // 此时禁止页面滚动 卡片移动
    
  },
  handleTouchMove(e) {
    moveY = parseInt(e.touches[0].clientY);
    moveOut = moveY - startY;
    if (moveOut <= -50) {
      return;
    }
    if (moveOut >= 30) {
      moveOut = 30
    }
    // console.log(`translateY(${moveOut}rpx)`);
    // console.log(moveOut);
    //动态更新coverTransform的值
    this.setData({
      coverTransition: '',
      coverTransform: `translateY(${moveOut}rpx)` //ES6模板字符串  同等'translateY(' + moveOut +'rpx)'
    })
  },
  handleTouchEnd() {
    this.setData({
      coverTransform: 'translateY(0rpx)',
      coverTransition: 'transform 1s'
    })
  },


  // 点击跳转登录页面
  clickLoginInfo() {
    //微信跳转方法 保留当前页面跳转
    wx.reLaunch({
      url: '/pages/login/login',
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