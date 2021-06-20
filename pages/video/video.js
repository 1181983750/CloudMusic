// pages/video/video.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签列表数据
    navId: '', // 导航的标识
    videoList: [], // 视频列表数据
    videoId: '', // 视频id标识
    videoUrlList: [], //视频地址
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 标识下拉刷新是否被触发
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
    wx.showLoading({
      title: '加载中',
    })
    this.getVideoGroupListData();
  },
  //获取导航数据  
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 12),
      navId: videoGroupListData.data[0].id
    })
    //获取列表数据    
    this.getVideoList(this.data.navId);
  },

  // 点击切换导航的回调
  changeNav(e) {
    let navId = e.currentTarget.id;
    this.setData({
      navId: navId * 1,   //相当于转为int型
      videoList: []
    })
    //显示正在加载微信官方接口
    wx.showLoading({
      title: '加载中',
    })
    //动态获取当前选中导航栏视频数据
    this.getVideoList(this.data.navId);
  },
  //获取视频列表数据
  async getVideoList(navId) {
    if (!navId) {
      return;
    }
    let VideoListData = await request('/video/group', { id: navId });
    if (VideoListData.datas.length === 0) {
      wx.showToast({
        title: '暂无推荐视频',
        icon: 'none'
      })
      return;
    }
    //关闭加载提示
    wx.hideLoading();

    // let index = 0;
    let videoList = VideoListData.datas;
    // item.id = index++;
    // return item;

    this.setData({
      videoList: videoList,
      //关闭下拉刷新
      isTriggered: false
    })
  },
  // 封装一个获取视频地址函数
  //点击播放回调
  async handlePlay(e) {
    //播放新视频之前找到上一个正在播放的视频并关闭
    let vid = e.currentTarget.id;
    let videoUrlData = await request('/video/url', { id: vid });
    let videoUrl = videoUrlData.urls[0].url;
    this.setData({
      videoUrlList: videoUrl,
      videoId: vid
    })



    //创建控制video的实例对象
    this.videoContext = wx.createVideoContext(vid);
    //判断当前的视频是否播放过，有播放记录，有则跳转到之上次播放的位置
    let { videoUpdateTime } = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    }

    //this.videoContext.play();
  },

  //监听视频播放进度
  handleTimeUpdate(e) {
    let videoTimeObj = { vid: e.currentTarget.id, currentTime: e.detail.currentTime };
    let { videoUpdateTime } = this.data;

    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    //如果数组中有当前视频对应的时间就更新，没有则添加
    if (videoItem) {
      videoItem.currentTime = videoTimeObj.currentTime;
    } else {
      videoUpdateTime.push(videoTimeObj);
    }
    //更新
    this.setData({
      videoUpdateTime: videoUpdateTime
    })
  },

  //视频播放结束调用
  handleEnded(e) {
    //移除播放时长数组中以结束的视频
    let { videoUpdateTime } = this.data;

    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === e.currentTarget.id), 1);
    this.setData({
      videoUpdateTime: videoUpdateTime
    })
  },
  //自定义下拉刷新
  handleRefresher() {
    this.getVideoList(this.data.navId);
  },
  //自定义上拉触底继续加载更多分页
  handleToLower() {
    let newVideoList = [
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_BCD5FA9271B97533550A2877FF96E5B2",
          "coverUrl": "https://p2.music.126.net/ixD2VBfn921amxqFd1l1Zw==/109951163572715190.jpg",
          "height": 720,
          "width": 1280,
          "title": "李宗盛2016年演唱会演唱林忆莲的《不必在乎我是谁》，泪洒当场！",
          "description": "李宗盛2016年演唱会演唱林忆莲的《不必在乎我是谁》，泪洒当场！",
          "commentCount": 3952,
          "shareCount": 24515,
          "resolutions": [
            {
              "resolution": 240,
              "size": 40612698
            },
            {
              "resolution": 480,
              "size": 58328845
            },
            {
              "resolution": 720,
              "size": 94646532
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 430000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/s7UbKTvdHKzfQCRCoqbGEw==/18781857627506469.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 430100,
            "birthday": -2209017600000,
            "userId": 440542582,
            "userType": 0,
            "nickname": "虐心音乐厅",
            "signature": "音乐视频自媒体",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 18781857627506468,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "18781857627506469",
            "backgroundImgIdStr": "109951162868126486"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 254120,
              "name": "滚石唱片行",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 14242,
              "name": "伤感",
              "alg": null
            },
            {
              "id": 14133,
              "name": "李宗盛",
              "alg": null
            },
            {
              "id": 13222,
              "name": "华语",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_49542422_9VANeg9E.webp?wsSecret=d21ae9b32c9a9071c00b0175b7296c9b&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "不必在乎我是谁",
              "id": 257202,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 8336,
                  "name": "林忆莲",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 8,
              "v": 21,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 25656,
                "name": "不必在乎我是谁",
                "picUrl": "http://p3.music.126.net/4U1ZESzGMLI7DGaO9y_5AQ==/109951164973485450.jpg",
                "tns": [],
                "pic_str": "109951164973485450",
                "pic": 109951164973485460
              },
              "dt": 260653,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 10429170,
                "vd": 7412
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 6257520,
                "vd": 10013
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4171694,
                "vd": 11681
              },
              "a": null,
              "cd": "1",
              "no": 1,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 5436711,
              "cp": 1416623,
              "publishTime": 736185600000,
              "privilege": {
                "id": 257202,
                "fee": 8,
                "payed": 1,
                "st": 0,
                "pl": 999000,
                "dl": 999000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 260,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "BCD5FA9271B97533550A2877FF96E5B2",
          "durationms": 338000,
          "playTime": 13653455,
          "praisedCount": 82891,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_6079942F18A2160EF7CEC24827886C7F",
          "coverUrl": "https://p2.music.126.net/Np0B72tyHtpblrPTHWW8jg==/109951163574337633.jpg",
          "height": 1080,
          "width": 1920,
          "title": "每当我落魄的时候，这首歌能带给我很大的正能量，人生起落在歌中！",
          "description": null,
          "commentCount": 2825,
          "shareCount": 6337,
          "resolutions": [
            {
              "resolution": 240,
              "size": 43186028
            },
            {
              "resolution": 480,
              "size": 73081350
            },
            {
              "resolution": 720,
              "size": 107927958
            },
            {
              "resolution": 1080,
              "size": 170977280
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/4sWaDyT4P_TEvIXQFCfbQA==/109951164160429563.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 110101,
            "birthday": -2209017600000,
            "userId": 1465790417,
            "userType": 0,
            "nickname": "浪味音",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164160429570,
            "backgroundImgId": 109951162868128400,
            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "泛生活视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951164160429563",
            "backgroundImgIdStr": "109951162868128395"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 24134,
              "name": "弹唱",
              "alg": null
            },
            {
              "id": 13223,
              "name": "许巍",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_1977905823_unBLA7KM.webp?wsSecret=0a87c37a467ba0c4a6d7740a9b287aba&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "曾经的你",
              "id": 167975,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 5770,
                  "name": "许巍",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "600902000005652557",
              "fee": 1,
              "v": 140,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 16967,
                "name": "每一刻都是崭新的",
                "picUrl": "http://p3.music.126.net/GoiTB6oG3vQWntnCjKRw0g==/109951163092691594.jpg",
                "tns": [],
                "pic_str": "109951163092691594",
                "pic": 109951163092691600
              },
              "dt": 261414,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 10459472,
                "vd": -18585
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 6275701,
                "vd": -16029
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4183815,
                "vd": -14426
              },
              "a": null,
              "cd": "1",
              "no": 3,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 5300126,
              "cp": 7002,
              "publishTime": 1102521600007,
              "privilege": {
                "id": 167975,
                "fee": 1,
                "payed": 1,
                "st": 0,
                "pl": 999000,
                "dl": 999000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 0,
                "toast": false,
                "flag": 1284,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "6079942F18A2160EF7CEC24827886C7F",
          "durationms": 400396,
          "playTime": 4854035,
          "praisedCount": 34855,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_54335D6264A5081FDE333FCC7967AFC7",
          "coverUrl": "https://p2.music.126.net/iDGVkbY8GVSPpJ8Z2TiMMw==/109951164482072555.jpg",
          "height": 360,
          "width": 640,
          "title": "我的天空。",
          "description": null,
          "commentCount": 759,
          "shareCount": 1499,
          "resolutions": [
            {
              "resolution": 240,
              "size": 23195107
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 630000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/eDpMfWV_8Zzj7lbF2SKRuw==/109951165978690436.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 632700,
            "birthday": 951897847918,
            "userId": 1406891392,
            "userType": 0,
            "nickname": "诺尕_f5aK",
            "signature": "别来打扰我的世界",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165978690430,
            "backgroundImgId": 109951165914486990,
            "backgroundUrl": "http://p1.music.126.net/eSI8CdPxIP8lOTJM3kNIrA==/109951165914486998.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951165978690436",
            "backgroundImgIdStr": "109951165914486998"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 4101,
              "name": "娱乐",
              "alg": null
            },
            {
              "id": 3101,
              "name": "综艺",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "54335D6264A5081FDE333FCC7967AFC7",
          "durationms": 210084,
          "playTime": 2609619,
          "praisedCount": 15233,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_26D657DBA89F4AD4EBA34240D232393D",
          "coverUrl": "https://p2.music.126.net/1BG_GBCk9eIUvRc3hux0_g==/109951165057155448.jpg",
          "height": 720,
          "width": 1280,
          "title": "【皇后乐队】WeWillRockYou+WeAreTheChampion（Live）",
          "description": null,
          "commentCount": 33,
          "shareCount": 75,
          "resolutions": [
            {
              "resolution": 240,
              "size": 21085437
            },
            {
              "resolution": 480,
              "size": 34320561
            },
            {
              "resolution": 720,
              "size": 37439883
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 420000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/aIA2_v8g5SPGt5dorWoN4w==/109951162867082009.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 420100,
            "birthday": -2209017600000,
            "userId": 428255055,
            "userType": 0,
            "nickname": "糊涂哲学",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951162867082020,
            "backgroundImgId": 2002210674180201,
            "backgroundUrl": "http://p1.music.126.net/o3G7lWrGBQAvSRt3UuApTw==/2002210674180201.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951162867082009",
            "backgroundImgIdStr": "2002210674180201"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57106,
              "name": "欧美现场",
              "alg": null
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 107113,
              "name": "Queen",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "We Will Rock You",
              "id": 1869271,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 41906,
                  "name": "Queen",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 8,
              "v": 26,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 188708,
                "name": "Queen Rocks",
                "picUrl": "http://p4.music.126.net/dMcDWqZnkWeKd-5BZGHosg==/109951165300702419.jpg",
                "tns": [],
                "pic_str": "109951165300702419",
                "pic": 109951165300702420
              },
              "dt": 121000,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 4868338,
                "vd": -2300
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 2921066,
                "vd": -2
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 1947430,
                "vd": -2
              },
              "a": null,
              "cd": "1",
              "no": 1,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 5308462,
              "cp": 1416089,
              "publishTime": 878486400007,
              "privilege": {
                "id": 1869271,
                "fee": 8,
                "payed": 1,
                "st": 0,
                "pl": 320000,
                "dl": 320000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 320000,
                "fl": 128000,
                "toast": false,
                "flag": 0,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "26D657DBA89F4AD4EBA34240D232393D",
          "durationms": 337316,
          "playTime": 61023,
          "praisedCount": 439,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_7C473857635429E55FC3DDCF3F1CFC48",
          "coverUrl": "https://p2.music.126.net/4Gw6dRxu7sSn5Rl9ax21jg==/109951165042042018.jpg",
          "height": 1080,
          "width": 1920,
          "title": "《达拉崩吧》2019火箭少女101飞行演唱会 广州站",
          "description": "披荆斩棘天使，翼火箭少女101",
          "commentCount": 166,
          "shareCount": 61,
          "resolutions": [
            {
              "resolution": 240,
              "size": 85300374
            },
            {
              "resolution": 480,
              "size": 143364020
            },
            {
              "resolution": 720,
              "size": 217246627
            },
            {
              "resolution": 1080,
              "size": 321554062
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 440000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/kyhQR6NBQ1-S7giPA0kO8w==/109951165934973569.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 440100,
            "birthday": 814118400000,
            "userId": 354919632,
            "userType": 4,
            "nickname": "Truly不二家",
            "signature": "打工人！",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165934973570,
            "backgroundImgId": 109951165924894720,
            "backgroundUrl": "http://p1.music.126.net/I5ULBXHX2ADLj2bPe8ZBzA==/109951165924894713.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人"
            },
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951165934973569",
            "backgroundImgIdStr": "109951165924894713"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 58101,
              "name": "听BGM",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 57110,
              "name": "饭拍现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 3102,
              "name": "二次元",
              "alg": null
            },
            {
              "id": 15102,
              "name": "华语音乐",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2962668629_ylR08dMY.webp?wsSecret=1c76c321ae23a15ad9caaa9a3de3203a&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "达拉崩吧 (Live)",
              "id": 1434062381,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 1030001,
                  "name": "周深",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 8,
              "v": 1,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 86840264,
                "name": "歌手·当打之年 第8期",
                "picUrl": "http://p3.music.126.net/P11c_X9qdAMT7yXYIMahQw==/109951164840856331.jpg",
                "tns": [],
                "pic_str": "109951164840856331",
                "pic": 109951164840856340
              },
              "dt": 245640,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 9827565,
                "vd": -64022
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 5896557,
                "vd": -61489
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 3931053,
                "vd": -59815
              },
              "a": null,
              "cd": "01",
              "no": 6,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 0,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 0,
              "cp": 1416682,
              "publishTime": 0,
              "privilege": {
                "id": 1434062381,
                "fee": 8,
                "payed": 1,
                "st": 0,
                "pl": 999000,
                "dl": 999000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 68,
                "preSell": false
              }
            },
            {
              "name": "达拉崩吧",
              "id": 521493845,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 11975111,
                  "name": "ilem",
                  "tns": [],
                  "alias": []
                },
                {
                  "id": 906118,
                  "name": "洛天依",
                  "tns": [],
                  "alias": []
                },
                {
                  "id": 983028,
                  "name": "言和",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": null,
              "fee": 8,
              "v": 16,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 36875139,
                "name": "达拉崩吧",
                "picUrl": "http://p3.music.126.net/gRpQYV_qFRIDJhlFSRkHsA==/109951163074675820.jpg",
                "tns": [],
                "pic_str": "109951163074675820",
                "pic": 109951163074675820
              },
              "dt": 208117,
              "h": null,
              "m": null,
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 3330342,
                "vd": -4800
              },
              "a": null,
              "cd": "1",
              "no": 1,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 0,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 0,
              "cp": 1416739,
              "publishTime": 1497456000000,
              "privilege": {
                "id": 521493845,
                "fee": 8,
                "payed": 1,
                "st": 0,
                "pl": 128000,
                "dl": 128000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 128000,
                "fl": 128000,
                "toast": false,
                "flag": 68,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "7C473857635429E55FC3DDCF3F1CFC48",
          "durationms": 449515,
          "playTime": 364962,
          "praisedCount": 1597,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8D80A3A4A5B16B6C6AD6148D07E0DD37",
          "coverUrl": "https://p2.music.126.net/Xg_qxdqZmQPKp3pHq-1gog==/109951163990473323.jpg",
          "height": 1080,
          "width": 1920,
          "title": "前方核能！超燃神曲现场版，万人音乐演唱会现场太疯狂！",
          "description": "人气女王花泽香菜的《恋爱循环》有没有一种让你心动的感觉呢？《only my railgun》现任主唱南条爱乃，也是被称为最燃现场持有者，歌曲是TV动画《某科学的超电磁炮》的片头曲，《极乐净土》由90后MARIA演唱的歌曲，旋律血洗各大网站，舞蹈也是被疯狂模仿，日本，音乐现场，动漫。",
          "commentCount": 540,
          "shareCount": 590,
          "resolutions": [
            {
              "resolution": 240,
              "size": 38822367
            },
            {
              "resolution": 480,
              "size": 51231685
            },
            {
              "resolution": 720,
              "size": 75387184
            },
            {
              "resolution": 1080,
              "size": 135720569
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 320000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/8Y1SU7AOluwwydYEFbXwMw==/109951163801847081.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 320700,
            "birthday": 684774000000,
            "userId": 1425128922,
            "userType": 0,
            "nickname": "零点音乐秀",
            "signature": "分享国内外好听的歌曲，给您不一样的音乐感受！",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163801847090,
            "backgroundImgId": 109951162868128400,
            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163801847081",
            "backgroundImgIdStr": "109951162868128395"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1101,
              "name": "舞蹈",
              "alg": null
            },
            {
              "id": 1105,
              "name": "最佳饭制",
              "alg": null
            },
            {
              "id": 60101,
              "name": "日语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 3110,
              "name": "宅舞",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 15241,
              "name": "饭制",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2436744142_Tk5HbEiA.webp?wsSecret=27a27f469b63f67e0c9339118f221f9a&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8D80A3A4A5B16B6C6AD6148D07E0DD37",
          "durationms": 200170,
          "playTime": 4891854,
          "praisedCount": 12282,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_93CDC144017B1932C07DF1B5C0B0A53E",
          "coverUrl": "https://p2.music.126.net/ksIXp4DBXxX5IPQs8_aOWg==/109951163707589641.jpg",
          "height": 720,
          "width": 1280,
          "title": "18岁时的邓紫棋演唱《囚鸟》，小天后的舞台气场已初现！",
          "description": "18岁时的邓紫棋演唱《囚鸟》，小天后的舞台气场已初现！",
          "commentCount": 161,
          "shareCount": 174,
          "resolutions": [
            {
              "resolution": 240,
              "size": 26247103
            },
            {
              "resolution": 480,
              "size": 43819156
            },
            {
              "resolution": 720,
              "size": 63538378
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 710000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/5o854xH3bkGHwLpa0AOuRA==/109951163650074554.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 710100,
            "birthday": -2209017600000,
            "userId": 1664328643,
            "userType": 0,
            "nickname": "台灣音樂風雲榜",
            "signature": "權威音樂榜單持續即時更新，最新發片動態，歌曲MV，及時更新。合作投稿請私訊！",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163650074560,
            "backgroundImgId": 109951164316932430,
            "backgroundUrl": "http://p1.music.126.net/-So6gvMBSiEWeBnPii7QDg==/109951164316932439.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "视频达人(华语、音乐现场)"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163650074554",
            "backgroundImgIdStr": "109951164316932439"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 4101,
              "name": "娱乐",
              "alg": null
            },
            {
              "id": 3101,
              "name": "综艺",
              "alg": null
            },
            {
              "id": 16233,
              "name": "G.E.M.邓紫棋",
              "alg": null
            },
            {
              "id": 76108,
              "name": "综艺片段",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2167626435_9ouu1RSn.webp?wsSecret=c9cd342696f4ed0e1a9c7ae86daa2620&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "囚鸟",
              "id": 27946600,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 7763,
                  "name": "G.E.M.邓紫棋",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 0,
              "v": 671,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 2698126,
                "name": "热门华语199",
                "picUrl": "http://p4.music.126.net/3pv8lK7KprUmmDxp2oAsqQ==/109951163926969423.jpg",
                "tns": [],
                "pic_str": "109951163926969423",
                "pic": 109951163926969420
              },
              "dt": 275000,
              "h": null,
              "m": null,
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4414219,
                "vd": 31363
              },
              "a": null,
              "cd": "1",
              "no": 1,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 2,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 0,
              "cp": 0,
              "publishTime": 1356969600004,
              "privilege": {
                "id": 27946600,
                "fee": 0,
                "payed": 0,
                "st": 0,
                "pl": 128000,
                "dl": 128000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 128000,
                "fl": 128000,
                "toast": false,
                "flag": 128,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "93CDC144017B1932C07DF1B5C0B0A53E",
          "durationms": 278221,
          "playTime": 341285,
          "praisedCount": 1334,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_D87983A741CF39ECBAADC1529772CDE9",
          "coverUrl": "https://p2.music.126.net/rGBp39hCt9396M5K8A6Ksg==/109951163573863028.jpg",
          "height": 720,
          "width": 1280,
          "title": "陈奕迅2014韩国MAMA一首《浮夸》震撼全场！",
          "description": "2014年韩国MAMA典礼，陈奕迅作为邀请嘉宾， 一首《浮夸》唱功震撼全场、超强演唱实力震撼当场所有人，今天再看一次依旧无敌的存在！[强][强]",
          "commentCount": 2442,
          "shareCount": 3835,
          "resolutions": [
            {
              "resolution": 240,
              "size": 27515432
            },
            {
              "resolution": 480,
              "size": 44072000
            },
            {
              "resolution": 720,
              "size": 62459617
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 510000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/fsS0ghfHy7zpQ1VNaO7Igg==/109951163468947517.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 510100,
            "birthday": 814118400000,
            "userId": 95799637,
            "userType": 204,
            "nickname": "和我去音乐现场",
            "signature": "B站搜索：和我去音乐现场\n【合作推广私信联系】",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163468947520,
            "backgroundImgId": 109951165609262770,
            "backgroundUrl": "http://p1.music.126.net/S51mzKfQGXIcqntNKNLx7g==/109951165609262764.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐视频达人",
              "2": "欧美音乐资讯达人"
            },
            "djStatus": 0,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951163468947517",
            "backgroundImgIdStr": "109951165609262764"
          },
          "urlInfo": null,
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57105,
              "name": "粤语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 14209,
              "name": "孤独",
              "alg": null
            },
            {
              "id": 16237,
              "name": "粤语",
              "alg": null
            },
            {
              "id": 23134,
              "name": "陈奕迅",
              "alg": null
            }
          ],
          "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_1719879501_ye6p7oZe.webp?wsSecret=c6670d7637525dedde874615f6d9e77a&wsTime=1622960438",
          "previewDurationms": 4000,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "浮夸",
              "id": 66282,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 2116,
                  "name": "陈奕迅",
                  "tns": [],
                  "alias": []
                }
              ],
              "alia": [],
              "pop": 100,
              "st": 0,
              "rt": "600902000005290680",
              "fee": 8,
              "v": 145,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 6491,
                "name": "U-87",
                "picUrl": "http://p3.music.126.net/Bl1hEdJbMSj5YJsTqUjr-w==/109951163520311175.jpg",
                "tns": [],
                "pic_str": "109951163520311175",
                "pic": 109951163520311170
              },
              "dt": 283520,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 11343456,
                "vd": -17900
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 6806091,
                "vd": -15400
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4537408,
                "vd": -13800
              },
              "a": null,
              "cd": "1",
              "no": 5,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "mv": 303285,
              "cp": 7003,
              "publishTime": 1117555200000,
              "privilege": {
                "id": 66282,
                "fee": 8,
                "payed": 1,
                "st": 0,
                "pl": 999000,
                "dl": 999000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 4,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "D87983A741CF39ECBAADC1529772CDE9",
          "durationms": 284119,
          "playTime": 4508064,
          "praisedCount": 34909,
          "praised": false,
          "subscribed": false
        }
      }
    ];
    let videoList = this.data.videoList;
    // 将视频列表原有视频再次加到列表中  ...三联运算符拆包
    videoList.push(...newVideoList);
    this.setData({
      videoList: videoList
    })

  },
  //搜索音乐的回调
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
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
  onShareAppMessage: function ({ from }) {
    console.log(from);
    if (from == 'button') {
      return {
        title: '来自button的转发内容',
        page: '/pages/video/video',
        imageUrl: 'https://p1.music.126.net/6DAVdrbFYHZIkeyhS2rr9w==/109951164003276159.jpg'
      }
    } else {
      return {
        title: '来自menu的转发内容',
        page: '/pages/video/video',
        imageUrl: ''
      }
    }

  }
})