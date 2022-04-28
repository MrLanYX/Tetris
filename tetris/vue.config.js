/**
 * 配置该文件可以参考:
 * https://cli.vuejs.org/zh/config/#%E7%9B%AE%E6%A0%87%E6%B5%8F%E8%A7%88%E5%99%A8
 *
 */
module.exports = {
  publicPath: '/Tetris/',
  lintOnSave: true,
  productionSourceMap: false,
  // 配置转发代理
  devServer: {
    host: '0.0.0.0',
    port: 88,
    disableHostCheck: true,
  }
}
