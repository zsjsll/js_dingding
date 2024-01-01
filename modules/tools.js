module.exports = {
    getCurrentTime,
    getCurrentDate,
    backHome,
    isDeviceLocked,
    isInWhiteList,
    isFind,
    setVolume,
    setStorageData,
    getStorageData,
    brightScreen,
    unlockScreen,
    lockScreen,
    holdOn,
    a: () => {
        console.log(1231231231)
    },
}

/**
 *唤醒设备
 *
 * @param {Screen_brightness} brightness 亮度
 */
const brightScreen = (brightness) => {
    device.wakeUpIfNeeded() // 唤醒设备
    device.keepScreenOn() // 保持亮屏
    device.setBrightnessMode(0) // 手动亮度模式
    device.setBrightness(brightness)
    device.cancelVibration() //取消震动

    return device.isScreenOn ? true : false
}

/**
 *解锁屏幕
 *
 * @param {number} time // 滑动时间：毫秒
 * @param {number} y1 // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些 0.9
 * @param {number} y2 // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置 0.1
 */
const unlockScreen = (time, y1, y2) => {
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

    sleep(1e3) // 等待解锁动画完成
}

/**
 *锁屏
 *
 *
 */
const lockScreen = () => {
    // device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
    if (isRoot()) Power()
    sleep(2e3)
}

/**
 * 随机等待
 *
 * @param {Delay} delay
 */
const holdOn = (delay) => (delay <= 0 ? 0 : sleep(0, delay))

/**
 * 格式化日期，把小于10数字前+"0"并转换成字符串
 *
 * @param {number} num
 */
const formatDateDigit = (num) => (num < 10 ? "0" + num.toString() : num.toString())

/**
 *获取现在的时间
 *
 * @return {string} 格式化后的时间
 */
const getCurrentTime = () => {
    const currentDate = new Date()
    const hours = formatDateDigit(currentDate.getHours())
    const minute = formatDateDigit(currentDate.getMinutes())
    // let second = formatDateDigit(currentDate.getSeconds())
    const formattedTimeString = hours + ":" + minute
    return formattedTimeString
}

/**
 *获取现在日期
 *
 * @return {string} 格式化后的日期
 */
const getCurrentDate = () => {
    const WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
    const currentDate = new Date()
    const year = formatDateDigit(currentDate.getFullYear())
    const month = formatDateDigit(currentDate.getMonth() + 1)
    const date = formatDateDigit(currentDate.getDate())
    const week = currentDate.getDay()
    const formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

/**
 *返回再退出到桌面,共需要时间4s
 *
 * @param {Package_id} home_id
 */

const backHome = (home_id) => {
    if (currentPackage() === home_id) return
    // 先退回到桌面
    sleep(1e3)
    for (let i = 0; i < 9; i++) {
        back()
        sleep(200)
    }
    // 再点击home键
    sleep(2e3)
    home()
    sleep(2e3)
    return
}

/**
 *屏幕是否锁定
 *
 * @return {boolean}
 */
const isDeviceLocked = () => {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    const km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

const isRoot = () => (shell("su -v").code === 0 ? true : false)

/**
 *通知白名单
 *
 * @param {Filter_switch } filter_switch
 * @param {Package_id_list} white_list 白名单
 * @param {org.autojs.autojs.core.notification.Notification} find_package 截取的信息，和白名单进行对比
 * @return {boolean}
 */
const isInWhiteList = (filter_switch, white_list, find_package) => {
    if (filter_switch === false) return true
    const check = Object.values(white_list).some((item) => find_package.getPackageName() === item)
    return check ? true : false
}

/**
 *是否找到一些东西
 *
 * @param {*} something
 * @return {*}
 */
//FIX
const isFind = (something) => {
    return something !== null ? true : false
}

/**
 *设置音量
 *
 * @param {Volume} volume
 */
const setVolume = (volume) => {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    device.setAlarmVolume(volume)
}

// 保存本地数据
const setStorageData = (name, key, value) => {
    const storage = storages.create(name) // 创建storage对象
    storage.put(key, value)
}

// 读取本地数据
const getStorageData = (name, key) => {
    const storage = storages.create(name)
    if (storage.contains(key)) {
        return storage.get(key, "")
    }
    // 默认返回undefined
}
