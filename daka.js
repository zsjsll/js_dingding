//-------------设定运行参数------------------

const SCREEN_BRIGHTNESS = 100 //运行时屏幕亮度
const SCREEN_ON = true //运行时是否保持屏幕常亮

/**
 *程序入口
 *
 */
function main() {
    toastLog("开始运行程序")
    daka(9000)
    toastLog("运行完毕")
}

// ----------------打卡流程------------------
function daka(wait) {
    console.log("唤醒设备")
    let bs
    do {
        bs = BrightScreen(SCREEN_BRIGHTNESS, SCREEN_ON)

        if (!bs) {
            console.warn("设备未唤醒, 重试")
            continue
        } else {
            console.info("设备已唤醒")
        }
    } while (!bs)
    sleep(1e3)

    console.log("解锁屏幕")
    if (isDeviceLocked()) {
        UnlockScreen(320, 0.9, 0.1)
    }
    if (isDeviceLocked()) {
        console.error("上滑解锁失败, 请按脚本中的注释调整UnlockScreen中的 gesture(time, [x1,y1], [x2,y2]) 方法的参数!")
        return
    }
    console.info("屏幕已解锁")
    sleep(1e3) // 等待返回动画完成
    if (wait) {
        sleep(0, wait)
    }
}

/**
 *唤醒设备
 *
 * @param {number} brightness 亮度
 * @param {boolean} keepScreenOn 是否保持亮屏
 * @return {*}
 */
function BrightScreen(brightness, keepScreenOn) {
    device.setBrightnessMode(0) // 手动亮度模式
    device.setBrightness(brightness)
    device.wakeUpIfNeeded() // 唤醒设备
    if (keepScreenOn) {
        device.keepScreenOn() // 保持亮屏
    }

    return device.isScreenOn ? true : false
}

/**
 *
 *
 * @param {number} time // 滑动时间：毫秒
 * @param {number} y1 // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些 0.9
 * @param {number} y2 // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置 0.1
 */
function UnlockScreen(time, y1, y2) {
    gesture(
        time, // 滑动时间：毫秒 320
        [
            device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
            device.height * y1, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
        ],
        [
            device.width * 0.5, // 滑动终点 x 坐标：屏幕宽度的一半
            device.height * y2, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
        ]
    )

    sleep(1000) // 等待解锁动画完成
    home()
}

// ---------------功能函数------------------

/**
 *获取现在的时间
 *
 * @return {string} 格式化后的时间
 */
function getCurrentTime() {
    let currentDate = new Date()
    let hours = dateDigitToString(currentDate.getHours())
    let minute = dateDigitToString(currentDate.getMinutes())
    let second = dateDigitToString(currentDate.getSeconds())
    let formattedTimeString = hours + ":" + minute + ":" + second
    return formattedTimeString
}

/**
 *获取现在日期
 *
 * @return {string} 格式化后的日期
 */
function getCurrentDate() {
    const WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
    let currentDate = new Date()
    let year = dateDigitToString(currentDate.getFullYear())
    let month = dateDigitToString(currentDate.getMonth() + 1)
    let date = dateDigitToString(currentDate.getDate())
    let week = currentDate.getDay()
    let formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

/**
 *屏幕是否锁定
 *
 * @return {boolean}
 */
function isDeviceLocked() {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    let km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

/**
 *返回再退出到桌面
 *
 */
function backHome() {
    sleep(1000)
    back()
    back()
    back()
    back()
    back()
    back()
    back()
    back()
    back()
    sleep(1000)
    home()
}

main()
