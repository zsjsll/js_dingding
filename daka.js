//-------------设定运行参数------------------

const SCREEN_BRIGHTNESS = 100 //运行时屏幕亮度
const SCREEN_ON = true //运行时是否保持屏幕常亮

/** 打卡相关的设置 */

const ACCOUNT = "19988329986"
const PASSWD = "1313243"

let delay = 0 //随机等待时间，单位：分钟

const PACKAGE_ID = {
    QQ: "com.tencent.mobileqq", // QQ
    DD: "com.alibaba.android.rimet", // 钉钉
    XMSF: "com.xiaomi.xmsf", // 小米推送服务
    TASKER: "net.dinglisch.android.taskerm", // Tasker
    EMAIL: "com.android.email", // 系统内置邮箱
    OPPO_CLOCK: "com.android.alarmclock", // OPPO系统闹铃
    XIAOMI_CLOCK: "com.android.deskclock",
}

/**
 *程序入口
 *
 */
function main() {
    toastLog("开始运行程序")
    DaKa()
    toastLog("运行完毕")
}

// ----------------打卡流程------------------
function DingDing() {
    if (delay > 0) {
        console.log(`随机等待${delay}分钟以内开始打卡`)
        let time = delay * 1e3 * 6e1
        sleep(0, time)
    } else {
        console.log("开始打卡")
        Open(ACCOUNT, PASSWD)
    }
}
const DaKa = Init(DingDing)

// ----------------初始化------------------
function Init(func) {
    return () => {
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
            console.error(
                "上滑解锁失败, 请按脚本中的注释调整UnlockScreen中的 gesture(time, [x1,y1], [x2,y2]) 方法的参数!"
            )
            return
        }
        console.info("屏幕已解锁")
        sleep(1e3) // 等待返回动画完成

        setVolume(0)

        func()

        console.log("关闭屏幕")

        lockScreen(10e3)

        if (isDeviceLocked()) {
            console.info("屏幕已关闭")
        } else {
            console.error("屏幕未关闭, 请尝试其他锁屏方案, 或等待屏幕自动关闭")
        }
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
 *解锁屏幕
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

/**
 *锁屏
 *
 * @param {number} delay 延时时间，单位：毫秒
 */
function lockScreen(delay) {
    device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
    sleep(delay)
    // 锁屏方案1：Root
    Power()
    sleep(2e3)

    // 锁屏方案2：No Root
    // press(Math.floor(device.width / 2), Math.floor(device.height * 0.973), 1000) // 小米的快捷手势：长按Home键锁屏

    // 万能锁屏方案：向Tasker发送广播, 触发系统锁屏动作。配置方法见 2021-03-09 更新日志
    // app.sendBroadcast({ action: ACTION_LOCK_SCREEN })
}

/**
 *  启动并登陆钉钉
 */
function Open(account, passwd) {
    let count = 1
    do {
        console.info(`第${count}次登录...`)
        app.launchPackage(PACKAGE_ID.DD)
        console.log("正在启动" + app.getAppName(PACKAGE_ID.DD) + "...")

        sleep(10e3) // 等待钉钉启动
        console.log(currentPackage())

        if (currentPackage() !== PACKAGE_ID.DD) {
            console.warn("启动失败，重新启动...")
            count += 1
            continue
        }

        if (IsLogin()) {
            if (!IsInAppHome()) {
                console.info("重置界面...")
                backHome()
                sleep(1000)
                count += 1
                continue
            } else {
                console.info("账号已登录")
                return true
            }
        } else {
            console.info("账号未登录")

            let phone = id("et_phone_input").findOne()
            phone.setText(account)
            console.log("输入账号")

            let password = id("et_password").findOne()
            password.setText(passwd)
            console.log("输入密码")

            let privacy = id("cb_privacy").findOne()
            privacy.click()
            console.log("同意隐私协议")

            let btn_login = id("btn_next").findOne()
            btn_login.click()
            console.log("正在登陆...")
            sleep(10e3)
        }

        if (IsLogin()) {
            console.info("账号已登录")
            return true
        } else {
            console.error("连接错误,重新登录!")
            backHome()
            sleep(1000)
            count += 1
            continue
        }
    } while (count < 6)
    return false
}

/**
 * 使用 URL Scheme 进入考勤界面
 */
function AttendKaoQin(key) {
    if (key == false) {
        return console.error("无法登录!")
    }
    var url_scheme = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"

    if (CORP_ID != "") {
        url_scheme = url_scheme + "?corpId=" + CORP_ID
    }

    var a = app.intent({
        action: "VIEW",
        data: url_scheme,
        //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
    })
    let count = 1
    do {
        app.launchPackage(PACKAGE_ID.DD)
        console.warn(`第${count}次尝试...`)
        app.startActivity(a)
        console.log("正在进入考勤界面...")
        if (isInKaoqing()) {
            console.info("已进入考勤界面")
            sleep(1000)
            console.log("等待连接到考勤机...")
            sleep(2000)

            if (textContains("已连接").findOne(1000) || textContains("已进入").findOne(1000)) {
                // textContains("已连接").waitFor()
                console.info("可以打卡")
                sleep(1000)

                btn_register =
                    textMatches("上班打卡").clickable(true).findOnce() ||
                    textMatches("下班打卡").clickable(true).findOnce() ||
                    textMatches("迟到打卡").clickable(true).findOnce() ||
                    descMatches("迟到打卡").clickable(true).findOnce()
                if (btn_register) {
                    btn_register.click()
                    console.log("按下打卡按钮")
                } else {
                    click(device.width / 2, device.height * 0.56)
                    console.log("点击打卡按钮坐标")
                }
                sleep(1000)
                backHome()
                sleep(1000)
                return console.info("打卡成功")
            } else {
                console.error("不符合打卡规则,重新进入考勤界面!")
                back()
                sleep(2000)
                count += 1
                continue
            }
        } else {
            console.error("连接错误,重新进入考勤界面!")
            sleep(1000)
            back()
            sleep(1000)
            count += 1
            continue
        }
    } while (count < 6)

    home()
    return console.error("打卡失败!")
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

/**
 *设置音量
 *
 * @param {number} volume
 */
function setVolume(volume) {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    console.verbose("媒体音量:" + device.getMusicVolume())
    console.verbose("通知音量:" + device.getNotificationVolume())
}

/**
 *判断是否登录钉钉
 *
 * @return {boolean}
 */
function IsLogin() {
    return currentActivity() == "com.alibaba.android.user.login.SignUpWithPwdActivity" ? false : true
}

/**
 *判断是否在考勤界面
 *
 * @return {boolean}
 */
function IsInKaoQing() {
    if (
        textContains("申请").findOne(40000) &&
        textContains("打卡").findOne(40000) &&
        textContains("统计").findOne(40000) &&
        textContains("设置").findOne(40000)
    ) {
        return true
    }
    return false
}

function IsInAppHome() {
    if (
        textContains("消息").findOne(40000) &&
        textContains("协作").findOne(40000) &&
        textContains("工作台").findOne(40000) &&
        textContains("通讯录").findOne(40000) &&
        textContains("我的").findOne(40000)
    ) {
        return true
    }
    return false
}

main()
