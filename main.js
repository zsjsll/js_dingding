const init = require("./modules/init.js")
const target = require("./config/config.js")

if (!files.exists("./config.js")) files.copy("./config/config.js", "./config.js")
const source = require("./config.js")

const phone = require("./modules/phone.js")
const events = require("./modules/events.js")

;(function () {
    /** @type {Config} */
    const cfg = init.setConfig(target, source)
    init.setlog(cfg)
    console.info(cfg)

    const QQSendMsg = phone.phoneProcess(cfg, init.startQQSendMsg)
    const DDPunkIn = phone.phoneProcess(cfg, init.startDDPunkIn)

    events.bindVolumeKey(cfg)
})()
