import Pubsub, { publish } from 'pubsub-js';
import request from '../../utils/request';
const PubSub = require('pubsub-js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '', //歌曲ID
    isPlay: false, //是否播放中
    isMV: true,  //是否有MV
    day: '',  //保存天
    month: '', //保存月
    recommendList: [], //推荐歌曲列表
    recommendListLength: '', //保存推荐歌曲列表有几组数据
    index:0   //初始化点击的推荐歌曲列表下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          //跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }

    //获取每日推荐的日期
    let day = new Date().getDate();
    let month = new Date().getMonth() + 1;
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }
    this.setData({
      day: day,
      month: month //下标+1  因为0为起始
    })
    // 调用用户每日推荐歌曲
    this.getRecommendList();
    //订阅来自songDetail页面的消息 实现多个页面通讯数据单向绑定
    PubSub.subscribe('switchType', (msg, type) => {
      let recommendList = this.data.recommendList;
      let recommendListLength = this.data.recommendListLength - 1;
      let index = this.data.index;
      if (type === 'back' && index != 0) {    //判断songDetail里标签 id里的属性是否为上一首
        index -= 1;
      }else if(type === 'back' && index == 0){
        index = recommendListLength;
      }else if(type === 'next' && index < recommendListLength) {  //下一首
        index += 1;
      }else if(type === 'next' && index == recommendListLength){
        index = 0;
      }
      this.setData({
        index:index
      })
      //将点击上一首或下一首的音乐id 传给songDetail页面
      let musicId = recommendList[index].id;
      PubSub.publish('musicId',musicId);
    });
  },
  //获取用户每日推荐歌曲
  async getRecommendList() {
    let recommendListData = await request("/recommend/songs");
    let reason = recommendListData.data.recommendReasons[0]  //热门标题
    let id = recommendListData.data.dailySongs[0].id;
    let recommendListLength = recommendListData.data.dailySongs.length;
    this.setData({
      recommendListLength: recommendListLength,
      recommendList: recommendListData.data.dailySongs,
      id: id,
      reason: reason
    })
  },
  // 点击播放 跳转到播放页面  
  async toSongDetail(e) {
    let song = e.currentTarget.dataset.song;
    let index = e.currentTarget.dataset.index; //保存点击音频下标
    let SelcetId = e.currentTarget.dataset.song.id; //保存选择歌曲的id
    console.log(e);
    //跳转到新页面是参数 也传入过去 ?键值=   
    //**JSON格式对象** 参数song{song}将传入目标地址的onload(options)的options对象里
    wx.navigateTo({
      //微信小程序 会判断长度过长 会自动截取字符串
      // url: '/pages/songDetail/songDetail?song' + JSON.stringify(song)
      url: '/pages/songDetail/songDetail?musicId=' + song.id
    })
    this.setData({
      isPlay: true,
      SelcetId: SelcetId,
      index: index
    })

  },

  play(){
    let {id} = this.data
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + id
    })
  },

  // 跳转到音乐MV播放页面
  toMv(e) {
    console.log('跳转至MV播放页');
  },
  //更多选项弹窗
  toMore(e){
    console.log('更多选项');
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