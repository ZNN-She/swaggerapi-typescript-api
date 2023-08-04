# swaggerapi-typescript-api
根据服务端swagger文档，自动生成ts定义和api接口代码，节省大量写接口的时间，目前测试的是swagger 2.x版本的文档，同理如果有需要只需升级openapi-typescript，然后做相应转换调整


## 使用

### 安装
```
yarn add swaggerapi-typescript-api -D
```
### 使用
1.  新建配置文件apiConfig.js
```js
  const { swaggerapiTs } = require('swaggerapi-typescript-api')

  swaggerapiTs([
    {
      url: 'http://172.17.13.80:8090/ls-commoditymain/v2/api-docs',
      fileName: 'ls-commoditymain'
    },
    {
      url: 'http://172.17.13.9:9999/activity-app/v2/api-docs',
      fileName: 'activity-app'
    }
  ]);
```
2.  添加package.json命令
```js
  "scripts": {
    "api": "node ./apiConfig.js"
  },
```

3. 执行命令
```js
  yarn api
```

### axiosInstance.ts

* 会自动生成axios的示例文件axiosInstance.ts，该文件只会生成一次
* 可以直接在该文件下添加各种拦截器

## options[]

| 参数 | 说明   | 类型  | 是否必传 | 默认值 | 版本 |
| - | - | - | - | - | - |
| url | Swagger Api 文档地址 | String | 是 | 无 | * | 
| fileName | 输出的文件名字，一般对应服务端应用名 | string | 否 | api | * | 
| output | 输出目录，注意输出目录需要手动新建 | string | 否 | api | * | 


## 举例

![alt](/src/lib/imgs/1.png)
![alt](/src/lib/imgs/2.png)
![alt](/src/lib/imgs/3.png)
![alt](/src/lib/imgs/4.png)


