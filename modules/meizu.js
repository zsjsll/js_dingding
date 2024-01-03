const tools = require("./tools.js")

module.exports = { phoneProcess }

/**
 *
 *
 * @param {Config} config
 */
function turnOn(config) {
    if (config.DEV) config.SCREEN_BRIGHTNESS = 70
    const isScreenOn = tools.brightScreen(config.SCREEN_BRIGHTNESS)
    if (!isScreenOn) {
        console.error("唤醒设备失败!")
        return false
    }
    sleep(500)
    if (tools.isDeviceLocked()) {
        console.log("解锁屏幕")
        unlockScreen(config.UNLOCKSCREEN)
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

function turnOff() {
    tools.backHome()
    console.log("关闭屏幕")
    tools.lockScreen()
    if (tools.isDeviceLocked()) {
        console.info("屏幕已关闭")
        return
    }
    console.error("屏幕未关闭, 请尝试其他锁屏方案, 或等待屏幕自动关闭")
}

/**
 *
 *
 * @param {Config} config
 * @param {Function} func

 */

function phoneProcess(config, func) {
    return (some) => {
        turnOn(config)
        func(config, some)
        turnOff()
    }
}
