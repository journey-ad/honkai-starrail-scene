module.exports = {
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

  // configureWebpack: {
  //   devtool: false,
  // },
}