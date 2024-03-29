// 配置路由映射关系表

import Vue from 'vue'
import VueRouter from 'vue-router'
// import News_publish from '@/views/news_publish/index.vue'

const Article = () => import('views/article/')
const Comment = () => import('views/comment/')

const Home = () => import('views/home/')
const Layout = () => import('views/layout/')
const Login = () => import('views/login/')

const Publish = () => import('views/publish/')
const Setting = () => import('views/setting/')

const News = () => import('views/news/')

// eslint-disable-next-line camelcase
const News_publish = () => import('views/news_publish/')

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: Login,
    component: Login
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '/article',
        name: Article,
        component: Article
      },
      {
        path: '/comment',
        name: Comment,
        component: Comment
      },
      // {
      //   path: '/fans',
      //   name: Fans,
      //   component: Fans
      // },
      {
        path: '/',
        name: Home,
        component: Home
      },
      // {
      //   path: '/material',
      //   name: Material,
      //   component: Material
      // },
      {
        path: '/publish',
        name: Publish,
        component: Publish
      },
      {
        path: '/setting',
        name: Setting,
        component: Setting
      },
      {
        path: '/news',
        name: News,
        component: News
      },
      {
        path: '/news_publish',
        name: News_publish,
        component: News_publish
      }
    ]
  }
]

const router = new VueRouter({
  routes
  // mode: 'history'
})

// 添加路由导航守卫
// router.beforeEach((to, from, next) => {
//   const userInfo = JSON.parse(window.localStorage.getItem('FBMS_User_Info'))
//   // 校验非登录页面的登录状态
//   if (to.path !== '/login') {
//     if (userInfo) {
//       // 已登录，允许通过
//       next()
//     } else {
//       // 没有登录，跳转到登录页面
//       next('/login')
//       // next()
//     }
//   } else {
//     // 登录页面，正常允许通过
//     next()
//   }
// })

export default router
