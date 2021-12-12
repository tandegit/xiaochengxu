var amapFile = require('../libs/amap-wx.130.js'); //如：..­/..­/libs/amap-wx.js

//上面是天气的
const app = getApp()

var api_url = "https://api.heclouds.com/devices/803953674/datapoints"
var api_post_url = "https://api.heclouds.com/cmds?device_id=803953674"
var device_api_url = "https://api.heclouds.com/devices/803953674/datapoints"
var api_key = 'tsJ=NFFpq69girfSt1Ve8f9JUfY='
var client = null
var a = 0 //风扇
var t = 26 //空调温度赋值



Page({
  data: {
    LED1: 0,
    LED2: 0,
    Fanonoff: 0,
    airFlag: 0,
    mode: 1,
    LED1_checked: false,
    LED2_checked: false,
    Fanonoff_checked: false,
    airFlag_checked: false,
    model_checked: false,
    //上面五个涉及按钮遍历
    FanFlag: 0,
    tempperature: 26,
    airFlag_str: "关闭",
    model_str: "制热",
    settemp: 26,
    array: ['0', '1', '2', '3', '4'],
    index: 0,
    objectArray: [{
        id: 0,
        name: '0'
      },
      {
        id: 1,
        name: '1'
      },
      {
        id: 2,
        name: '2'
      },
      {
        id: 3,
        name: '3'
      },
      {
        id: 4,
        name: '4'
      }
    ],
    //天气数据
    area: '请求中', //城区
    city: '请求中',
    airtext: '请求中',
    airValue: 0,
    air_temp: 0,
    weather: '请求中',
    onenet: '未连接', //服务器标志位
    shebei: '未在线', //设备标志位

    update: '',
    basic: {},
    today: {},
    tomorrow: {},
    afterTomor: {},
  },





  //连接服务器获取按钮的值
  onLoad: function (options) {
    var that = this;
    //console.log(options.device_id);// 打印设备ID
    //console.log(app.data.api_key);// 打印API_KEY
    wx.request({
      url: api_url,
      header: {
        'api-key': api_key
      },
      methods: "GET",
      success(e) {
        console.log("连接服务器成功")
        that.setData({
          onenet: '已连接'
        })
        wx.showToast({
          title: '连接服务器成功',
          duration: 2000, //停留时间
        })
      },
      fail() {
        onLoad()
        that.setData({
          onenet: '未连接'
        })
        wx.showToast({
          title: '与服务器通信失败',
          icon: 'fail',
          duration: 2000
        })
      },
    })

    

    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const key = 'ba0bcdde1a6842d6b3780aaf6fe059db'
        wx.request({ //关于空气质量
          url: `https://devapi.qweather.com/v7/air/now?location=${longitude},${latitude}&key=${key}`, //天气数据的api
          success(res) {
            that.setData({
              airtext: res.data.now.category,
              airValue: res.data.now.aqi,
            })
          }
        })
        wx.request({ //关于天气情况
          url: `https://devapi.qweather.com/v7/weather/now?location=${longitude},${latitude}&key=${key}`, //天气数据的api
          success(res) {
            that.setData({
              weather: res.data.now.text,
              air_temp: res.data.now.temp
            })
            if (that.data.air_temp >= 26) {
              that.setData({ //过25主动开空调（仅限一次）
                airFlag: 1,
                airFlag_checked: true
              })
              wx.showToast({
                title: '25都主动开空调',
                duration: 1500, //停留时间
              })
            }
          }
        })

        wx.request({ //关于城市位置
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=RIEBZ-5MC6V-5QJPL-UOIRM-ZN6WQ-35B5L`, //腾讯地图的api
          success(res) {
            that.setData({
              area: res.data.result.address_component.city,
              city: res.data.result.address_component.district
            })
          }
        })

      }
    })


    //监听，五秒一次,要开就把注释删去
    setInterval(function (options) {
      wx.request({
        url: api_url,
        header: {
          'api-key': api_key
        },
        methods: "GET",
        success(e) {
          that.setData({
            tempperature: e.data.data.datastreams[5].datapoints[0].value,
            LED1: e.data.data.datastreams[2].datapoints[0].value,
            LED2: e.data.data.datastreams[1].datapoints[0].value,
            FanFlag: e.data.data.datastreams[3].datapoints[0].value,
            airFlag: e.data.data.datastreams[4].datapoints[0].value,
            index: e.data.data.datastreams[3].datapoints[0].value,
          })
          if (that.data.LED1) {
            that.setData({
              LED1_checked: true
            })
          } else {
            that.setData({
              LED1_checked: false
            })
          } //LED1
          if (that.data.LED2) {
            that.setData({
              LED2_checked: true
            })
          } else {
            that.setData({
              LED2_checked: false
            })
          } //LED2
          if (that.data.Fanonoff) {
            that.setData({
              Fanonoff_checke: true
            })
          } else {
            that.setData({
              Fanonoff_checke: false
            })
          } //Fanonoff
          if (that.data.airFlag) {
            that.setData({
              airFlag_checked: true
            })
          } else {
            that.setData({
              airFlag_checked: false
            })
          } //airFlag

        }
      })
    }, 900)

    setInterval(function (options) {
      wx.request({
        url: api_url,
        header: {
          'api-key': api_key
        },
        methods: "GET",
        success(e) {
          that.setData({
            mode: e.data.data.datastreams[0].datapoints[0].value,
            settemp: e.data.data.datastreams[6].datapoints[0].value
          })
          if (!that.data.mode) {
            console.log('检测为制热', that.data.FanFlag)
            that.setData({
              mode_checked: true,
              model_str: "制热"
            })
          } else {
            console.log('检测为制冷', that.data.FanFlag)
            that.setData({
              mode_checked: false,
              model_str: "制冷"
            })
          }

        }
      })
    }, 3000)
    //获取设备在不在线，可用于嵌套
    wx.request({
      url: "https://api.heclouds.com/devices/803953674",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        "api-key": api_key
      },
      data: {},
      success(res) {
        // console.log(res)
        if (res.data.data.online) {
          console.log("设备已在线")
          that.setData({
            shebei: "已在线"
          })
        } else {
          console.log("设备未在线")
          that.setData({
            shebei: "未在线"
          })
        }
      },
      fail(res) {
        console.log("请求失败")
      },
      complete() {

      }
    })

    wx.showShareMenu({
      withShareTicket: true
    })
  },


  onShareAppMessage: function () {
    return {
      title: '老谭的小程序',
      success: function (res) {
        wx.hideShareMenu()
      },
      fail: function (res) {}
    }
  },
  //分享朋友圈权限
  onShareTimeline: function () {
    return {
      title: '老谭的小程序',
      query: {  // key: 'value' //要携带的参数
      }, imageUrl: '' //分享图,默认小程序的logo
    }
  },

  onairFlagchange: function (event) {
    var that = this
    console.log(event.detail)
    let sw = event.detail.value
    console.log("空调状态" + event.detail.value)
    if (!sw) {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "airFlag": 0
        },
        method: "POST",
        success: function (t) {
          that.setData({
            airFlag: 0,
            airFlag_str: "关闭"
          })
          console.log("空调关闭", a),
            wx.showToast({
              title: '空调关闭',
              duration: 2000, //停留时间
            })
        }
      });
    } else {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: "{airFlag:1}",
        method: "POST",
        success: function (t) {
          that.setData({
            airFlag: 1,
            airFlag_str: "开启"
          })
          console.log("空调开启"),
            wx.showToast({
              title: '空调开启',
              duration: 2000, //停留时间
            })
        }
      });
    }
  },
  onmodelchange: function (event) {
    var that = this
    console.log(event.detail)
    let sw = event.detail.value
    var that = this;
    if (that.data.airFlag) {
      if (!sw) {
        wx.request({
          url: api_post_url,
          header: {
            "api-key": api_key
          },
          data: {
            "mode": 1
          },
          method: "POST",
          success: function (t) {
            that.setData({
              mode: 1,
              model_str: "制冷"
            })
            console.log("空调制冷中")
          }
        });
      } else {
        wx.request({
          url: api_post_url,
          header: {
            "api-key": api_key
          },
          data: {
            "mode": 0
          },
          method: "POST",
          success: function (t) {
            that.setData({
              mode: 0,
              model_str: "制热"
            })
            console.log("空调制热")
          }
        });
      }
    } else {
      console.log("空调还没开，无法调模式")
    }
  },

  kongtiaotempdown: function () {
    var that = this
    if (that.data.airFlag) {
      if (that.data.settemp >= 17) {
        t = that.data.settemp
        t--
        wx.request({
          url: api_post_url,
          header: {
            "api-key": api_key
          },
          data: {
            "settemp": t
          },
          method: "POST",
          success: function () {
            that.setData({
              settemp: t,
            })
            console.log("空调调低为%d", t),
              wx.showToast({
                title: '调低温度',
                duration: 100, //停留时间
              })
          }
        });
      } else {
        console.log("不能再低了")
      }
    } else {
      console.log("空调还没开，无法调温度")
      wx.showToast({
        title: '空调还没开',
        icon: "error",
        duration: 1000, //停留时间
      })
    }
  },

  kongtiaotempup: function () {
    var that = this;
    if (that.data.airFlag) {
      if (that.data.settemp <= 45) {
        t = that.data.settemp
        t++
        wx.request({
          url: api_post_url,
          header: {
            "api-key": api_key
          },
          data: {
            "settemp": t
          },
          method: "POST",
          success: function () {
            that.setData({
              settemp: t,
            })
            console.log("空调调高为%d", t),
              wx.showToast({
                title: '调高温度',
                duration: 100, //停留时间
              })
          }
        });
      } else {
        console.log("不能再高了")
      }
    } else {
      console.log("空调还没开，无法调温度")
      wx.showToast({
        title: '空调还没开',
        icon: "error",
        duration: 1000, //停留时间
      })
    }
  },

  onLED1change: function (event) {
    var that = this
    console.log(event.detail)
    let sw = event.detail.value
    if (sw) {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "LED1": 1
        },
        method: "POST",
        success: function () {
          that.setData({
            "LED1": 1,
          })
          console.log("LED1开启"),
            wx.showToast({
              title: 'LED1开',
              duration: 1000, //停留时间
            })
        }
      });
    } else {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "LED1": 0
        },
        method: "POST",
        success: function () {
          that.setData({
            "LED1": 0,
          })
          console.log("LED1关闭"),
            wx.showToast({
              title: 'LED1关',
              duration: 1000, //停留时间
            })
        }
      });
    }

  },

  onLED2change: function (event) {
    var that = this
    console.log(event.detail)
    let sw = event.detail.value
    if (sw) {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "LED2": 1
        },
        method: "POST",
        success: function () {
          that.setData({
            "LED2": 1,
          })
          console.log("LED2开启"),
            wx.showToast({
              title: 'LED2开',
              duration: 1000, //停留时间
            })
        }
      });
    } else {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "LED2": 0
        },
        method: "POST",
        success: function () {
          that.setData({
            "LED2": 0,
          })
          console.log("LED2关闭"),
            wx.showToast({
              title: 'LED2关',
              duration: 1000, //停留时间
            })
        }
      });
    }
  },

  Fanonoffchange: function (event) {
    var that = this
    console.log(event.detail)
    let sw = event.detail.value
    if (sw) {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "Fanonoff": 1
        },
        method: "POST",
        success: function () {
          that.setData({
            "Fanonoff": 1,
          })
          console.log("风扇开启"),
            wx.showToast({
              title: '风扇开',
              duration: 1000, //停留时间
            })
        }
      });
    } else {
      wx.request({
        url: api_post_url,
        header: {
          "api-key": api_key
        },
        data: {
          "Fanonoff": 0
        },
        method: "POST",
        success: function () {
          that.setData({
            "Fanonoff": 0,
          })
          console.log("风扇关闭"),
            wx.showToast({
              title: '风扇关',
              duration: 1000, //停留时间
            })
        }
      });
    }
  },

  bindPickerChange: function (e) {
    var that = this
    a = parseInt(e.detail.value)
    wx.request({
      url: api_post_url,
      header: {
        "api-key": api_key
      },
      data: {
        "FanFlag": a
      },
      method: "POST",
      success: function () {
        that.setData({
          index: e.detail.value,
          FanFlag: a
        })
        console.log('风扇调为', that.data.FanFlag),
          console.log('picker发送选择改变，携带值为', e.detail.value)
      }
    })
  },

  

  
})