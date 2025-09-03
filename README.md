# dingding

## 介绍

### 打卡

- MI 9 MIUI 10 9.8.2 开发版
- 本项目使用 typescript

### 适用版本：

- autox
  - 6.4.3 稳定 可以打包
  - 6.5.8 未测试 但应该是可以用的
  - [6.6.0](https://github.com/zsjsll/js_dingding/releases/download/0.0.2/Autox-v6-arm64-v8a-release-6.6.0.apk) 稳定，兼容小米权限设置
  - [6.6.7](https://github.com/zsjsll/js_dingding/releases/download/0.0.2/Autox-v6-arm64-v8a-release-6.6.7.apk) 稳定,用这个吧
- 钉钉 [7.0.42.11](https://github.com/zsjsll/js_dingding/releases/download/0.0.1/dingding-7.0.42.11-1068.apk)
- QQ
  - [9.1.65](https://github.com/zsjsll/js_dingding/releases/download/0.0.2/9.1.65.apk) 这个能用 就用这个
  - [9.1.67](https://github.com/zsjsll/js_dingding/releases/download/0.0.2/9.1.67.apk) 用旧不用新

### 手机设置

- 取消锁屏界面
- 熄屏时间 5min
- 闹钟

### 使用

`pnpm i`

`pnpm add -g @swc/cli @swc/core`

### 打包

`pnpm run build`

打包文件存放于 `dist/`

### ps

使用时，会自动生成 config.json 根据需要自行修改。

QQ 要发送的人的 qq 必须在消息的第一个（置顶）。

仅研究学习使用。
