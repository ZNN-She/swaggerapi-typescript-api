const fs = require("node:fs");
const axios = require('axios');
const chalk = require('chalk');
const path = require('path')


const swaggerApiTypescriptBufferMemory = 'SwaggerApiTypescriptBufferMemory.js'

async function getSwaagerDoc(url) {
  const res = await axios.get(url)
  return res.data || {}
}

/**
 * url: 获取 swagger api 例如：地址 http://172.17.13.80:8090/ls-commoditymain/v2/api-docs
 * output: 输出的文件目录 默认 ’./src/api‘
 * fileName: 输出文件的名字 默认 api
 */
async function createApi(options) {
  console.log('API: ' + chalk.blue('start create api ...'));

  const { url, output = './src/api', fileName = 'api' } = options;

  let apiStr = '';
  const swaagerDoc = await getSwaagerDoc(url);
  const swaagerDocPaths = swaagerDoc.paths;
  const swaagerDocDefinitions = swaagerDoc.definitions;
  const swaggerApiTypescriptTemporaryFiles = fs.readFileSync(`${output}/${fileName}.d.ts`).toString();

  let outputJsObj = swaggerApiTypescriptTemporaryFiles;
  // 转换
  outputJsObj = outputJsObj.substring(outputJsObj.indexOf('export interface paths'), outputJsObj.indexOf('export interface definitions'));
  outputJsObj = outputJsObj.replace(/export interface paths/ig, '');
  outputJsObj = outputJsObj.replace(/;/ig, ',');
  outputJsObj = outputJsObj.replace(/operations\[/ig, '');
  outputJsObj = outputJsObj.replace(/\],/ig, ',');
  // outputJsObj = outputJsObj.replace(/\n/ig, '');
  // outputJsObj = outputJsObj.replace(/ /ig, '');
  outputJsObj = 'var paths = ' + outputJsObj + 'module.exports = paths';
  await fs.writeFileSync(`${output}/${fileName}${swaggerApiTypescriptBufferMemory}`, outputJsObj)


  const interfacePath = await require(`${path.resolve()}/${output}/${fileName}${swaggerApiTypescriptBufferMemory}`)
  const pathsUrls = Object.keys(interfacePath);

  pathsUrls.forEach((path) => {
    const pathItem = interfacePath[path]
    const apiKey = path.split('/').slice(1).join('_').replace(/-|{|}/ig, ''); // 方法名 下划线链接
    const methods = Object.keys(pathItem);

    methods.forEach((method) => {
      const isResult = swaagerDocPaths[path][method].responses['200']?.schema; // 是否有返回结果
      const originalRef = swaagerDocPaths[path][method].responses['200']?.schema?.originalRef;
      const $ref = swaagerDocPaths[path][method].responses['200']?.schema?.$ref;

      let paramsStr = '';
      if (swaagerDocPaths[path][method].parameters && swaagerDocPaths[path][method].parameters[0]?.schema?.$ref) {
        let swaagerDocDefinitionsKey = swaagerDocPaths[path][method].parameters[0].schema.$ref.split('/').pop()
        paramsStr = `\nparameters: definitions['${swaagerDocDefinitionsKey}']\n`
      }else if(swaagerDocPaths[path][method].parameters){
        const parametersType = swaagerDocPaths[path][method]?.parameters[0].in;
        paramsStr = `\nparameters: operations['${interfacePath[path][method]}']['parameters']['${parametersType}']\n`
      }

      let resultStr = swaagerDocPaths[path][method].responses['200']?.schema?.type || 'unknown';
      if (isResult) {
        if (originalRef) {
          resultStr = swaagerDocDefinitions[originalRef].properties.data ? `definitions['${originalRef}']['data']` : `definitions['${originalRef}']`
        } else if ($ref) {
          let swaagerDocDefinitionsKey = $ref.split('/').pop()
          resultStr = swaagerDocDefinitions[swaagerDocDefinitionsKey].properties.data ? `definitions['${swaagerDocDefinitionsKey}']['data']` : `definitions['${swaagerDocDefinitionsKey}']`
        }
      }

      if (paramsStr.length) {
        apiStr = apiStr + `\nexport const ${apiKey}_${method} = (${paramsStr}): Promise<${resultStr}> => axiosInstance.${method}('${path}', getParams(parameters));\n`
      } else {
        apiStr = apiStr + `\nexport const ${apiKey}_${method} = (${paramsStr}): Promise<${resultStr}> => axiosInstance.${method}('${path}');\n`
      }
    })
  })

  //
  apiStr = `/**
   * api
   */
 import { isArray } from 'lodash'
 import { operations, definitions} from './${fileName}.d'
 import axiosInstance from './axiosInstance'
 
 function getParams(parameters: any): any {
   if (typeof parameters === 'object' && !isArray(parameters)) {
     const keys = Object.keys(parameters);
     if (keys.length) {
       return parameters[keys[0]]
     }
     return {}
   } else {
     return parameters
   }
 }
 
 ` + apiStr;

  // 写入api文件
  await fs.writeFileSync(`${output}/${fileName}.ts`, apiStr);

  // 删除缓存文件
  await fs.unlink(`${path.resolve()}/${output}/${fileName}${swaggerApiTypescriptBufferMemory}`, () => { console.log('clear susess') });


  // 生成axios实例方法
  if (!fs.existsSync(`${output}/axiosInstance.ts`)) {
    await fs.writeFileSync(`${output}/axiosInstance.ts`, `/**
  * axios 请求封装
  */
 import axios, { InternalAxiosRequestConfig } from 'axios';
 
 const axiosInstance = axios.create({
   headers: {
     'Content-Type': 'application/json;charset=UTF-8'
   },
 });

 /**
  * 处理 xx/{id}/{xxx} 的请求
  */
 axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig<any> => {
    const pattern = /{([^}]+)}/g;

    const RESTfulParams = (config.url as string).match(pattern);
    if(RESTfulParams){
      const params = config.params || config.data || {};
      const paramsKeys = Object.keys(params);
      paramsKeys.forEach(k => {
        config.url = config.url?.replace(\`{\${k}}\`, params[k])
      })
      config.params = {}
      config.data = {}
    }else if(config.method === 'get'){
      config.params = config.data;
      config.data = {}
    }

    if(config.url?.indexOf('{') !== -1){

    }
    return config;
  },
  (err) => Promise.reject(err)
);
 
// 继续添加拦截器
 
 export default axiosInstance;
 `);
  }

  console.log('API: ' + chalk.blue('clear temporary files ...'));

  console.log('API: ' + chalk.green('create api success'));
}


module.exports = {
  createApi
}