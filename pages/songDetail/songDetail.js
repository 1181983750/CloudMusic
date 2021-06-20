// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js';
import moment from 'moment';
import request from '../../utils/request';
//获取全局实例
const appInstance = getApp();
// 进度条初始化 总时长的毫秒数(用于计算进度条宽度)
let dt = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLike: true,
    isPlay: false,//标识播放状态
    song: {},//歌曲详情对象
    musicId: '',//歌曲Id
    currentTime: '00:00',//当前时长
    durationTime: '00:00',//总时长
    currentWidth: 0,//实时进度条宽度
    lyric: [['Tip', '正在加载歌词']],//歌词
    lyricsIndex: 0,//歌词对应的时间
    currentLyric: "",//当前歌词对象
    isLyric: false   //封面与歌词切换
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options路由跳转参数
    let musicId = options.musicId;
    this.setData({
      musicId: musicId
    })
    this.getMusicInfo(musicId);
    this.getLyric(musicId);
    //判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      //修改当前页面音乐播放状态
      this.setData({
        isPlay: true
      })
    }
    this.handleMusicPlay();
    //创建控制音乐播放实例对象
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    //监视音乐播放与暂停
    this.backgroundAudioManager.onPlay(() => {
      //修改音乐播放状态
      this.changePlayState(true);

      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });
    //音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      //切歌
      PubSub.publish('switchType', 'next');
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
        lyric: [],
        lyricsIndex: 0,
      })
    })
    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      //获取歌词对应时间
      let lyricsIndex = Math.ceil(this.backgroundAudioManager.currentTime);
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss');
      // let currentWidth = (this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration) * 450;
      let currentWidth = this.backgroundAudioManager.currentTime / dt * 100000;
      this.setData({
        lyricsIndex,
        currentTime,
        currentWidth
      })

      this.getCurrentLyric();
    })

  },
  // 拖动进度条动作结束后的回调
  async handleSliderChange(e) {
    // console.log(e);
    // console.log(e.detail.value);
    await backgroundAudioManager.pause()
    let progress = e.detail.value / 100;
    // 计算拖动进度后的当前播放时间(毫秒)
    let time = dt * progress;
    backgroundAudioManager.seek(time / 1000)
    let currentTime = moment(time).format('mm:ss');
    // console.log(currentTime);

    // 处理播放时间跳转时歌词位置的校准
    if (this.data.lyrics.length > 1) {
      this.getCurrentLyricsIndex(time / 1000);
    }
    this.setData({
      currentTime,
      currentWidth: e.detail.value,
    })

    await backgroundAudioManager.play()

  },
  // 处理播放时间跳转时歌词位置的校准
  getCurrentLyricsIndex(time) {
    if (time > this.data.lyrics[this.data.lyrics.length - 1][0]) {
      this.setData({
        lyricsIndex: this.data.lyrics.length + 2
      })
      return;
    }
    let lyricsIndex = this.data.lyrics.findIndex(item => {
      return time <= item[0]
    })
    this.setData({
      lyricsIndex,
    })
  },
  //修改播放状态
  changePlayState(isPlay) {
    this.setData({
      isPlay: isPlay
    })
    //修改全局播放状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //点击暂停/播放的回调
  handleMusicPlay() {
    //修改是否播放的状态
    let isPlay = !this.data.isPlay;
    // this.setData({
    //   isPlay: isPlay
    // })
    let { musicId } = this.data;
    this.musicControl(isPlay, musicId);
  },
  //请求歌曲信息
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', { ids: musicId });
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    dt = songData.songs[0].dt

    this.setData({
      song: songData.songs[0],
      durationTime: durationTime
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  //歌曲播放控制功能
  async musicControl(isPlay, musicId) {

    if (isPlay) {//音乐播放
      //获取音频资源
      let musicLinkData = await request('/song/url', { id: musicId })
      let musicLink = musicLinkData.data[0].url;
      if (musicLink === null) {
        wx.showToast({
          title: '请开通会员后听取',
          icon: 'none'
        })
        return;
      }
      //歌曲播放
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    } else {//音乐暂停
      this.backgroundAudioManager.pause();
    }
  },

  //歌曲切换
  handleSwitch(event) {
    //切换类型
    let type = event.currentTarget.id;

    //关闭当前播放音乐
    this.backgroundAudioManager.stop();

    //订阅来自recommendSong页面
    PubSub.subscribe('musicId', (msg, musicId) => {
      //获取歌曲
      this.getMusicInfo(musicId);
      //自动播放当前音乐
      this.musicControl(true, musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
    })
    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type);
  },
  //歌词 封面切换显示
  handleLyric() {
    let flag = this.data.isLyric;
    if (flag) {
      flag = false
    } else {
      flag = true
    }
    this.setData({
      isLyric: flag
    })
  },
  //获取歌词
  async getLyric(musicId) {
    let lyricData = await request("/lyric", { id: musicId });
    let lyric = this.formatLyric(lyricData.lrc.lyric);
  },

  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        obj.text = text;
        result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
  },
  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
  },

  //控制歌词播放
  getCurrentLyric() {
    let j;
    for (j = 0; j < this.data.lyric.length - 1; j++) {
      if (this.data.lyricsIndex == this.data.lyric[j].time) {
        this.setData({
          currentLyric: this.data.lyric[j].text
        })
      }
    }
  },
  isLike() {
    let { isLike } = this.data;
    if (isLike) {
      isLike = false
    } else {
      isLike = true
    }
    this.setData({
      isLike: isLike
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