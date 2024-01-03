const init = require("./modules/init.js")
const target = require("./config/config.js")
const qq = require("./modules/qq.js")

if (!files.exists("./config.js")) files.copy("./config/config.js", "./config.js")
const source = require("./config.js")

// const meizu = require("./modules/meizu.js")

/** @type {Config} */
const cfg = init.setConfig(target, source)
console.log(cfg)

init.setAutojs(cfg)

// meizu.phoneProcess(cfg, init.startQQSendMsg)("测试")

qq.sendMsg("com.tencent.tim", "124119885", "msg")
