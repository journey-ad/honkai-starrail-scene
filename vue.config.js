module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? 'https://cdn.jsdelivr.net/gh/journey-ad/honkai-starrail-scene@gh-pages/'
    : '/',
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.(vert|frag)$/)
      .use('raw-loader')
      .loader('raw-loader')
      .tap(() => {
        return {
          esModule: false,
        }
      })
      .end()
  },

  productionSourceMap: true,

  // configureWebpack: {
  //   devtool: false,
  // },
}