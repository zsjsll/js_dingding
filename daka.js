//-------------设定运行参数------------------

const SCREEN_BRIGHTNESS = 100 //运行时屏幕亮度
const SCREEN_ON = true //运行时是否保持屏幕常亮

/** 打卡相关的设置 */

const ACCOUNT = ""
const PASSWD = ""

const QQ = ""
const CORP_ID = "" // 公司的钉钉CorpId, 如果只加入了一家公司, 可以不填

const OBSERVE_VOLUME_KEY = true // 监听音量-键, 开启后无法通过音量-键调整音量, 按下音量-键：结束所有子线程
const NOTIFICATIONS_FILTER = true // 是否过滤通知

const PACKAGE_ID = {
    QQ: "com.tencent.mobileqq", // QQ
    DD: "com.alibaba.android.rimet", // 钉钉
    XMSF: "com.xiaomi.xmsf", // 小米推送服务
    TASKER: "net.dinglisch.android.taskerm", // Tasker
    EMAIL: "com.android.email", // 系统内置邮箱
    OPPO_CLOCK: "com.android.alarmclock", // OPPO系统闹铃
    XIAOMI_CLOCK: "com.android.deskclock", //小米闹铃服务
}

const DELAY = 1 //随机等待时间，单位：分钟,如果填写的值<=0，则跳过等待时间

const GLOBAL_LOG_FILE_PATH = "/sdcard/脚本/Archive/" + getCurrentDate() + "-log.txt" // 运行日志路径

let suspend = false //是否暂停定时打卡
/**
 *程序入口
 *
 */
function main() {
    toastLog("开始运行程序")

    DaKa = Init(DaKa)
    watcher(DaKa)
}

// ----------------监听通知------------------
/**
 *
 *
 * @param {Function} func 执行一些动作
 */
function watcher(func) {
    sendQQMsg = Init(sendQQMsg) //初始化sendQQMsg，添加开机和关机的功能
    events.observeNotification()
    events.onNotification((n) => {
        console.log("应用包名: " + n.getPackageName())
        console.log("通知文本: " + n.getText())
        console.log("通知优先级: " + n.priority)
        console.log("通知目录: " + n.category)
        console.log("通知时间: " + new Date(n.when))
        console.log("通知数: " + n.number)
        console.log("通知摘要: " + n.tickerText)

        // 过滤 PackageId 白名单之外的应用所发出的通知
        if (!filterNotification(n.getPackageName(), n.tickerText, n.getText())) {
            return
        }

        // 监听摘要为 "定时打卡" 的通知, 不一定要从 Tasker 中发出通知, 日历、定时器等App均可实现
        //手机不显示‘定时打卡’只能监听通知包名
        if ((n.getText() == "定时打卡" || n.category == "alarm") && !suspend) {
            prepare()
            threads.shutDownAll()
            threads.start(function () {
                func(DELAY)
            })
        }

        switch (n.getText()) {
            case "打卡": // 监听文本为 "打卡" 的通知
                threads.shutDownAll()
                threads.start(() => func(0))
                break

            case "查询": // 监听文本为 "查询" 的通知
                threads.shutDownAll()
                threads.start(() => sendQQMsg(getStorageData("dingding", "clockResult")))
                break

            case "暂停": // 监听文本为 "暂停" 的通知
                suspend = true
                console.warn("暂停定时打卡")
                threads.shutDownAll()
                threads.start(() => sendQQMsg("修改成功, 已暂停定时打卡功能"))
                break

            case "恢复": // 监听文本为 "恢复" 的通知
                suspend = false
                console.warn("恢复定时打卡")
                threads.shutDownAll()
                threads.start(() => sendQQMsg("修改成功, 已恢复定时打卡功能"))
                break

            default:
                break
        }
        if (n.getText() == null) return

        // 监听钉钉返回的考勤结果
        if (n.getPackageName() == PACKAGE_ID.DD && n.getText().indexOf("考勤打卡") != -1) {
            let text = n.getText().indexOf("]") ? n.getText().slice(n.getText().indexOf("]") + 1) : n.getText()
            setStorageData("dingding", "clockResult", text)

            setTimeout(() => {
                threads.shutDownAll()
                threads.start(() => sendQQMsg(text))
            }, 2000) //等待，这样可以打断锁屏，并且让console.log()输出完整

            return
        }
    })

    events.setKeyInterceptionEnabled("volume_down", OBSERVE_VOLUME_KEY)

    if (OBSERVE_VOLUME_KEY) {
        events.observeKey()
    }

    // 监听音量-键
    events.onKeyDown("volume_down", () => {
        threads.shutDownAll()
        device.setBrightnessMode(1)
        device.cancelKeepingAwake()
        toast("已中断所有子线程!")

        // 可以在此调试各个方法
    })

    toastLog("监听中, 请在日志中查看记录的通知及其内容")
}

// ----------------打卡流程------------------
let DaKa = (d) => {
    console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
    holdOn(d)
    console.log("开始打卡")
    if (openDD(ACCOUNT, PASSWD)) {
    } else return console.error("无法登录!")

    attendKaoQin(CORP_ID)
}

// ----------------初始化------------------
function Init(func) {
    return (d) => {
        auto.waitFor()
        auto.waitFor()

        // 创建运行日志
        console.setGlobalLogConfig({ file: GLOBAL_LOG_FILE_PATH })

        console.log("唤醒设备")
        let bs
        do {
            bs = brightScreen(SCREEN_BRIGHTNESS, SCREEN_ON)

            if (!bs) {
                console.warn("设备未唤醒, 重试")
                continue
            } else console.info("设备已唤醒")
        } while (!bs)
        sleep(500)

        console.log("解锁屏幕")
        if (isDeviceLocked()) {
            unlockScreen(320, 0.9, 0.1)
        }
        if (isDeviceLocked()) {
            console.error(
                "上滑解锁失败, 请按脚本中的注释调整UnlockScreen中的 gesture(time, [x1,y1], [x2,y2]) 方法的参数!"
            )
            return
        }
        console.info("屏幕已解锁")

        setVolume(0)
        backHome()
        func(d)
        backHome()

        console.log("关闭屏幕")

        lockScreen()
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
function brightScreen(brightness, keepScreenOn) {
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
function unlockScreen(time, y1, y2) {
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
}

/**
 *锁屏
 *
 *
 */
function lockScreen() {
    device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
    sleep(1000)

    // 锁屏方案1：Root

    if (iskRoot()) {
        Power()
    } else {
    }

    sleep(5e3)

    // 锁屏方案2：No Root
    // press(Math.floor(device.width / 2), Math.floor(device.height * 0.973), 1000) // 小米的快捷手势：长按Home键锁屏

    // 万能锁屏方案：向Tasker发送广播, 触发系统锁屏动作。配置方法见 2021-03-09 更新日志
    // app.sendBroadcast({ action: ACTION_LOCK_SCREEN })
}

/**
 *随机等待
 */
function holdOn(delay) {
    if (delay <= 0) {
        return
    } else {
        let randomTime = random(1e3, delay * 1e3 * 60)
        toastLog(Math.floor(randomTime / 1000) + "秒后启动" + app.getAppName(PACKAGE_ID.DD) + "...")
        sleep(randomTime)
    }
}

/**
 *  启动并登陆钉钉
 */
function openDD(account, passwd) {
    let count = 1
    do {
        console.info(`第${count}次登录...`)
        app.launchPackage(PACKAGE_ID.DD)
        console.log("正在启动" + app.getAppName(PACKAGE_ID.DD) + "...")

        //用findOne()来进行等待，比直接用sleep()好

        // if (packageName(PACKAGE_ID.DD).findOne(15e3) === null) {
        //     console.warn("启动失败，重新启动...")
        //     count += 1
        //     continue
        // }
        
        packageName(PACKAGE_ID.DD).text("暂不更新").findOne(1e3).click()

        if (packageName(PACKAGE_ID.DD).text("登录").findOne(15e3) === null) {
            if (!isInAppHome()) {
                console.info("重置界面...")
                backHome()
                count += 1
                continue
            } else {
                console.info("账号已登录")
                return true
            }
        } else {
            console.info("账号未登录")

            id("et_phone_input").findOne(-1).setText(account)
            console.log("输入账号")

            id("et_password").findOne(-1).setText(passwd)
            console.log("输入密码")

            id("cb_privacy").findOne(-1).click()
            console.log("同意隐私协议")

            id("btn_next").findOne(-1).click()
            console.log("正在登陆...")
        }
        if (isInAppHome() && isLogin()) {
            console.info("账号已登录")
            return true
        } else {
            console.warn("连接错误,重新登录!")
            backHome()
            count += 1
            continue
        }
    } while (count < 6)
    return false
}

/**
 * 使用 URL Scheme 进入考勤界面
 */
function attendKaoQin(id) {
    let u = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
    let url = id === "" ? u : `${u}?corpId=${id}`

    let a = app.intent({
        action: "VIEW",
        data: url,
        //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
    })
    let count = 1
    do {
        app.launchPackage(PACKAGE_ID.DD)
        console.info(`第${count}次尝试打卡...`)
        app.startActivity(a)
        console.log("正在进入考勤界面...")
        if (isInKaoQing()) {
            console.info("已进入考勤界面")

            console.log("等待连接到考勤机...")

            if (textContains("考勤").findOne(15e3) != null) {
                // textContains("已连接").waitFor()
                console.info("可以打卡")

                let btn =
                    text("上班打卡").clickable(true).findOnce() ||
                    text("下班打卡").clickable(true).findOnce() ||
                    text("迟到打卡").clickable(true).findOnce()
                if (btn) {
                    btn.click()
                    console.log("按下打卡按钮")
                } else {
                    click(device.width / 2, device.height * 0.56)
                    console.log("点击打卡按钮坐标")
                }
                textContains("成功").findOne(-1)
                return console.info("打卡成功!")
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
    console.error("打卡失败!")
    return
}

/**
 * 发送QQ消息
 * @param {string} message 消息内容
 */
let sendQQMsg = (message) => {
    console.log("发送QQ消息")
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + QQ,
        packageName: PACKAGE_ID.QQ,
    })

    id("input").findOne(-1).setText(message)
    id("fun_btn").findOne(-1).click()

    console.info("发送成功")

    // waitForActivity("com.tencent.mobileqq.activity.SplashActivity")
}

// ---------------功能函数------------------
function dateDigitToString(num) {
    return num < 10 ? "0" + num : num
}

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

// 保存本地数据
function setStorageData(name, key, value) {
    const storage = storages.create(name) // 创建storage对象
    storage.put(key, value)
}

// 读取本地数据
function getStorageData(name, key) {
    const storage = storages.create(name)
    if (storage.contains(key)) {
        return storage.get(key, "")
    }
    // 默认返回undefined
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
 *返回再退出到桌面,共需要时间4s
 *
 */
function backHome() {
    sleep(1e3)
    if (iskRoot()) {
        for (let i = 0; i < 12; i++) Back()
        sleep(1e3)
        Home()
    } else {
        for (let i = 0; i < 12; i++) back()
        sleep(1e3)
        home()
    }
    sleep(2e3)
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
function isLogin() {
    // return currentActivity() != "com.alibaba.android.user.login.SignUpWithPwdActivity" ? true : false
    return text("登录").findOne(15e3) === null ? true : false
}

/**
 *判断是否在考勤界面
 *
 * @return {boolean}
 */
function isInKaoQing() {
    return text("申请").findOne(15e3) != null ? true : false
}

function isInAppHome() {
    return text("DING").findOne(15e3) != null ? true : false
}

/**
 *通知过滤
 *
 * @param {*} bundleId
 * @param {*} abstract
 * @param {*} text
 * @return {boolean}
 */
function filterNotification(bundleId, abstract, text) {
    var check = Object.values(PACKAGE_ID).some(function (item) {
        return bundleId == item
    })
    if (!NOTIFICATIONS_FILTER || check) {
        console.verbose(bundleId)
        console.verbose(abstract)
        console.verbose(text)
        console.verbose("---------------------------")
        return true
    } else {
        return false
    }
}

/**
 *自动跳过OPPO的闹铃，进入home界面
 *
 */
function prepare() {
    if (currentPackage() == "com.android.alarmclock") {
        let btn_close = id("el").findOne()
        btn_close.click()
        toast("关闭闹钟")
    }
    sleep(1000)
}

function iskRoot() {
    return shell("su -v").code === 0 ? true : false
}

main()
