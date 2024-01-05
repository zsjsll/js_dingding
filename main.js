let init = require("./modules/init.js")
let target = require("./config/config.js")

if (!files.exists("./config.js")) files.copy("./config/config.js", "./config.js")
let source = require("./config.js")

let phone = require("./modules/phone.js")
let observe = require("./modules/observe.js")

for (let k in observe) {
    observe[k] = require("./modules/tools.js").createCurry(observe[k])
}

;(function () {
    /** @type {Config} */
    let cfg = init.setConfig(target, source)
    init.setlog(cfg)
    console.info(cfg)

    phone.bindVolumeKey(cfg)

    let QQSendMsg = phone.phoneProcess(cfg, init.startQQSendMsg)
    let DDPunkIn = phone.phoneProcess(cfg, init.startDDPunkIn)

    let ob = [observe.printInfo, observe.listenClock(cfg, QQSendMsg, DDPunkIn)]

    phone.listener(ob)
})()
