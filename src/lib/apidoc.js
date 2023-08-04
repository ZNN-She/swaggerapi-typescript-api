
var shell = require('shelljs');

/**
 * @param url 文档地址
 * @param output 输出目录
 * @param fileName 输出文件名字
 */
async function apidocToTs(options) {
  const { url, output = 'api', fileName = './src/api' } = options
  // shell.exec(`yarn openapi-typescript http://172.17.13.80:8090/ls-commoditymain/v2/api-docs --output api.d.ts`)

  await shell.exec(`yarn openapi-typescript ${url} --output  ${output}/${fileName}.d.ts`)
}

module.exports = {
  apidocToTs
}