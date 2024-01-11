export function backHome(home_id: string) {
    if (currentPackage() === home_id) return
    // 先退回到桌面
    for (let i = 0; i < 5; i++) {
        back()
        sleep(200)
    }
    // 再点击home键
    home()
    sleep(1e3)
    return
}

export function openApp(package_id: string) {
    app.launchPackage(package_id)
    if (packageName(package_id).findOne(20e3) === null) return false
    else return true
}

function formatDateDigit(num: number) {
    return num < 10 ? "0" + num.toString() : num.toString()
}

export function getCurrentTime() {
    let currentDate = new Date()
    let hours = formatDateDigit(currentDate.getHours())
    let minute = formatDateDigit(currentDate.getMinutes())
    // let second = formatDateDigit(currentDate.getSeconds())
    let formattedTimeString = hours + ":" + minute
    return formattedTimeString
}

export function getCurrentDate() {
    let WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
    let currentDate = new Date()
    let year = formatDateDigit(currentDate.getFullYear())
    let month = formatDateDigit(currentDate.getMonth() + 1)
    let date = formatDateDigit(currentDate.getDate())
    let week = currentDate.getDay()
    let formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

/**
 *
 *
 * @export
 * @param {number} delay 小于等于0的时候，没有延时
 */
export function holdOn(delay: number) {
    if (delay <= 0) {
        return
    } else {
        let randomTime = random(1e3, delay * 1e3 * 60)
        toastLog(Math.floor(randomTime / 1000) + "秒后启动程序" + "...")
        sleep(randomTime)
    }
}

export function brightScreen(brightness: number) {
    device.wakeUpIfNeeded() // 唤醒设备
    if (brightness >= 0) {
        device.keepScreenOn() // 保持亮屏
        device.setBrightnessMode(0) // 手动亮度模式
        device.setBrightness(brightness)
    }
    device.cancelVibration() //取消震动

    return device.isScreenOn ? true : false
}

export function isDeviceLocked() {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    let km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

export type UnLockScreen = {
    T: number
    Y1: number
    Y2: number
}

export function unlockScreen(opt: UnLockScreen) {
    gesture(
        opt.T, // 滑动时间：毫秒 320
        [
            device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
            device.height * opt.Y1, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
        ],
        [
            device.width * 0.5, // 滑动终点 x 坐标：屏幕宽度的一半
            device.height * opt.Y2, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
        ]
    )

    sleep(1e3) // 等待解锁动画完成
}

export function setVolume(volume: number) {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    device.setAlarmVolume(volume)
}

export function resetPhone() {
    device.setBrightness(50)
    device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
}

export function lockScreen() {
    device.cancelKeepingAwake() // 取消设备常亮
    if (isRoot()) Power()
    sleep(2e3)
}

function isRoot() {
    return shell("su -v").code === 0 ? true : false
}
