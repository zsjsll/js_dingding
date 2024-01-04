let init = require("./modules/init.js")
let target = require("./config/config.js")

if (!files.exists("./config.js")) files.copy("./config/config.js", "./config.js")
let source = require("./config.js")

let phone = require("./modules/phone.js")

;(function () {
    /** @type {Config} */
    let cfg = init.setConfig(target, source)
    init.setlog(cfg)
    console.info(cfg)

    phone.bindVolumeKey(cfg)

    let QQSendMsg = phone.phoneProcess(cfg, init.startQQSendMsg)
    let DDPunkIn = phone.phoneProcess(cfg, init.startDDPunkIn)
    phone.listener(cfg, QQSendMsg, DDPunkIn)
})()
