export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/booking/index',
    'pages/bill/index',
    'pages/mine/index',
    'pages/confirm/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2E7D32',
    navigationBarTitleText: '高尔夫球会',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F1F8E9'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/booking/index',
        text: '预约'
      },
      {
        pagePath: 'pages/bill/index',
        text: '账单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
