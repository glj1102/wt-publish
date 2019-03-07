# wt-publish

 Used for automatic publishing SDK

## install

```shell
npm i wt-publish -g
```

## use

```shell
#publish
wt-publish 
# or
wt-publish -N|--sdk <sdkName>
#如果有多个sdk也可以不加参数使用

#update
wt-publish -U|--update [sdkName]
#不指定 [sdkName] 时,将创建一个新的配置文件

# Clear the directory cache
wt-publish -C|--clear [sdkName]
# 不指定 [sdkName] 时,删除本目录所有配置
```
* 当前目录不存在package.json无法使用
* 支持从单个仓库生成多个sdk
* 首次使用需要配置仓库地址，千万别配置错了,否则会覆盖线上仓库
* 使用默认版本号时将不进行tag提交,默认版本号为远程仓库最新版本号
* 会在当前目录生成 publish.json 文件,可以直接修改配置使用,建议提交到github共享配置

## publish.json

```json
{
	"wt-tartarus-sdk-built": {
		"sdkName": "wt-tartarus-sdk-built",
		"script": "npm run build:sdk",
		"source": "sdk-build",
		"username": "atinc"
	}
}
```



 