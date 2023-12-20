module.exports = {
  configureWebpack: {
    resolve: {
      // 配置路径别名
      alias: {
        assets: '@/assets',
        components: '@/components',
        https: '@/https',
        utils: '@/utils',
        views: '@/views'
      }
    }
  },
  devServer: {
    port: 8081 // 修改为你想要使用的端口号
  }
}
