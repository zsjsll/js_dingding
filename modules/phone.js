let tools = require("./tools.js")
let observe = require("./observe.js")

module.exports = { phoneProcess, bindVolumeKey, listener }

/**
 *
 *
 * @param {Config} config
 */
function bindVolumeKey(config) {
    events.setKeyInterceptionEnabled("volume_down", config.OBSERVE_VOLUME_KEY)
    events.setKeyInterceptionEnabled("volume_up", config.OBSERVE_VOLUME_KEY)
    if (config.OBSERVE_VOLUME_KEY) {
        events.observeKey()
    }

    // 监听音量+键
    events.onKeyDown("volume_up", doSomething)
    // 监听音量-键
    events.onKeyDown("volume_down", doSomething)

    function doSomething() {
        require("./tools").resetPhone()
        threads.shutDownAll()
        toastLog("按下音量键,已中断所有子线程!")
        /* 调试脚本*/
    }
}

/**
 *
 *
 * @param {Config} config
 */
function turnOn(config) {
    if (config.DEV) config.SCREEN_BRIGHTNESS = -1
    let isScreenOn = tools.brightScreen(config.SCREEN_BRIGHTNESS)
    if (!isScreenOn) {
        console.error("唤醒设备失败!")
        return false
    }
    sleep(500)
    if (tools.isDeviceLocked()) {
        console.log("解锁屏幕")
        tools.unlockScreen(config.UNLOCKSCREEN)
        if (tools.isDeviceLocked()) {
            console.error(
                "上滑解锁失败, 请按脚本中的注释调整UnlockScreen中的 gesture(time, [x1,y1], [x2,y2]) 方法的参数!"
            )
            return false
        }
        console.log("屏幕已解锁")
    }
    tools.setVolume(0)
    tools.backHome()
}
/**
 *
 *
 * @param {Config} config
 */
function turnOff(config) {
    tools.backHome()
    if (config.DEV) tools.resetPhone()
    console.log("关闭屏幕")
    tools.lockScreen()
    if (tools.isDeviceLocked()) {
        console.info("屏幕已关闭")
        return
    }
    console.error("屏幕未关闭, 请尝试其他锁屏方案, 或等待屏幕自动关闭")
}

/**
 * 手机的流程
 *
 * @param {Config} config
 * @param {Function} func
 * @return {Function}
 */
function phoneProcess(config, func) {
    return (opt) => {
        turnOn(config)
        func(config, opt)
        turnOff(config)
    }
}

/**
 *
 *
 * @param {Function} QQ
 * @param {Function} DD
 * @param {Config} config

 */
function listener(config, QQ, DD) {
    return () => {
        events.observeNotification()

        events.onNotification((n) => {
            observe.printInfo(n)
            observe.listenClock(config, n)
            observe.listenMsg(config, QQ, DD, n)
        })
    }
}
