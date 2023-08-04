const { apidocToTs } = require("./apidoc.js");
const { createApi } = require("./require.js");

const OPTIOSN_DEFAULT = {
  output: './src/api',
  fileName: 'api'
}

/**
 * url: 获取 swagger api 例如：地址 http://172.17.13.80:8090/ls-commoditymain/v2/api-docs
 * output: 输出的文件目录 默认 ’./src/api‘
 * fileName: 输出文件的名字 默认 api
 */
const swaggerApiTs = async function (options) {
  const opt = {
    ...OPTIOSN_DEFAULT,
    ...options
  }
  await apidocToTs(opt)
  await createApi(opt)
}

async function init(options = []){
  options.forEach(async (item) => {
    await swaggerApiTs(item)
  })
}

module.exports = {
  swaggerapiTs: init
}