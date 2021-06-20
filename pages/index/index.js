// pages/index/index.js
import request from '../../utils/request';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    song:'', //初始化
    user_head: '',
    user_name: "音乐",
    msg: '初始化测试数据',
    background: [
      { url: '/static/upload/hd.jpg' },
      { url: '/static/upload/ykw.jpg' },
      { url: '/static/upload/qx.jpg' },
      { url: '/static/upload/zsh.jpg' }
    ],
    circular: true,
    icolor: '#d80000',
    indicatorDots: true,
    vertical: true,
    autoplay: true,
    interval: 5000,
    duration: 500,

    bannersList: [],    //轮播图地址
    recommendList: [],  //推荐歌单
    topList: [],        //飙升榜排行榜
    newList: [],         //新歌榜歌曲
    originalList: [],    //原创榜歌曲
    hotList: [],         //热歌榜歌曲
    vipList: []          //黑胶VIP爱听榜
  },

  handleParent() {
    console.log('Parent');
  },
  handleChild() {
    console.log('Child');
  },
  //跳转至logs页面的方法
  toLogs() {
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
  },
  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/banner', { type: 2 });  //轮播图
    let recommendListData = await request('/personalized', { limit: 15 }); //推荐歌单


    let topListArr = [];
    let topListData = await request('/playlist/detail',{id:19723756}) //飙升榜歌曲
    let topListItem = { name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0, 3) } //slice截取3个数组对象
    topListArr.push(topListItem);


    let newListArr = [];
    let newListData = await request('/playlist/detail', { id: 3779629 },) //新歌榜歌曲
    let newListItem = { name: newListData.playlist.name, tracks: newListData.playlist.tracks.slice(0, 3) }//slice截取3个数组对象
    newListArr.push(newListItem);

    let originalListArr=[];
    let originalListData = await request('/playlist/detail', { id: 2884035 },) //原创榜歌曲
    let originalListItem = { name: originalListData.playlist.name, tracks: originalListData.playlist.tracks.slice(0, 3) }//slice截取3个数组对象
    originalListArr.push(originalListItem);

    let hotListArr=[];
    let hotListData = await request('/playlist/detail', { id: 3778678 },) //热歌榜歌曲
    let hotListItem = { name: hotListData.playlist.name, tracks: hotListData.playlist.tracks.slice(0, 3) }//slice截取3个数组对象
    hotListArr.push(hotListItem);

    let vipListArr=[];
    let vipListData = await request('/playlist/detail', { id: 5453912201 },) //黑胶VIP爱听榜
    let vipListItem = { name: vipListData.playlist.name, tracks: vipListData.playlist.tracks.slice(0, 3) }//slice截取3个数组对象
    vipListArr.push(vipListItem);

    this.setData({
      bannersList: bannerListData.banners,    //取得返回的结果下的banners内容
      recommendList: recommendListData.result,
      topList:topListArr,
      newList: newListArr,
      originalList: originalListArr,
      hotList: hotListArr,
      vipList: vipListArr
    })


    // console.log(recommendListData.result)
    // console.log(bannerListData.banners);

    // wx.request({
    //   //发送请求读取轮播图 https://autumnfish.cn/banner
    //   url: 'https://autumnfish.cn/banner?type=2',
    //   data: {
    //     // banners:[]
    //   },
    //   success: (response) => {
    //     console.log('请求成功:', response);
    //     // banners = response.data.banners;
    //     // console.log(response.data.banners);
    //   },
    //   fail: (error) => {
    //     console.log('请求失败:', error);
    //   }
    // })
    //修改msg状态数据，语法：this.setData


  },
  //获取用户信息回调
  clickGetUserInfo(response) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      desc: '业务需要',
      success: (response) => {
        //拿到信息处理业务
        console.log(response);
        this.setData({
          userInfo: response.userInfo,
        })
      }
    })
  },
   //搜索音乐的回调
   toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  // 跳转至音乐列表页面
  toMusicList(e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/musicList/musicList?musiclistid=' + e.currentTarget.dataset.song.id
    })
  },
   // 跳转至歌单广场页面
   goToMusicListSquare() {
    wx.navigateTo({
      url: '/pages/musicListSquare/musicListSquare'
    })
  },
  // 跳转至点击歌曲的详情页面
  async toSongDetail(e) {
    // console.log(event);
    // console.log(e.currentTarget.dataset.song.id);
    // await this.getPlayingMusicList(musiclist)
    // wx.setStorageSync('playingMusicList', allTopList[currentPage])
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' +  e.currentTarget.dataset.song.id
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