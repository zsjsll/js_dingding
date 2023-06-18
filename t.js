//-------------设定运行参数

const ACCOUNT = "19988329986"
const PASSWORD = "1313243"

const QQ = "124119885"

const PACKAGE_ID = {
    QQ: "com.tencent.mobileqq", // QQ
    DD: "com.alibaba.android.rimet", // 钉钉
    XMSF: "com.xiaomi.xmsf", // 小米推送服务
    TASKER: "net.dinglisch.android.taskerm", // Tasker
    EMAIL: "com.android.email", // 系统内置邮箱
    OPPO_CLOCK: "com.android.alarmclock", // OPPO系统闹铃
    XIAOMI_CLOCK: "com.android.deskclock",
}

const LOWER_BOUND = 1 * 60 * 1000 // 最小等待时间：1min
const UPPER_BOUND = 4 * 60 * 1000 // 最大等待时间：4min

// 执行时的屏幕亮度（0-255）, 需要"修改系统设置"权限
const SCREEN_BRIGHTNESS = 0

// 是否过滤通知
const NOTIFICATIONS_FILTER = true

// 公司的钉钉CorpId, 获取方法见 2020-09-24 更新日志。如果只加入了一家公司, 可以不填
const CORP_ID = ""

// 锁屏意图, 配合 Tasker 完成锁屏动作, 具体配置方法见 2021-03-09 更新日志
const ACTION_LOCK_SCREEN = "autojs.intent.action.LOCK_SCREEN"

// 监听音量+键, 开启后无法通过音量+键调整音量, 按下音量+键：结束所有子线程
const OBSERVE_VOLUME_KEY = true

const WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]

// ======================== init ==========================

// 检查无障碍权限
auto.waitFor("normal")

// 是否暂停定时打卡
var suspend = false

// 本次打开钉钉前是否需要等待
var needWaiting = true

// 运行日志路径
var globalLogFilePath = "/sdcard/脚本/Archive/" + getCurrentDate() + "-log.txt"

// 创建运行日志
console.setGlobalLogConfig({
    file: "/sdcard/脚本/Archive/" + getCurrentDate() + "-log.txt",
})

// =================== ↓↓↓ 主线程：监听通知 ↓↓↓ ====================
// 监听本机通知
events.observeNotification()
events.on("notification", function (n) {
    notificationHandler(n)
})

events.setKeyInterceptionEnabled("volume_up", OBSERVE_VOLUME_KEY)

if (OBSERVE_VOLUME_KEY) {
    events.observeKey()
}

// 监听音量+键
events.onKeyDown("volume_up", function (event) {
    threads.shutDownAll()
    device.setBrightnessMode(1)
    device.cancelKeepingAwake()
    toast("已中断所有子线程!")

    // 可以在此调试各个方法
    // doClock()
    // sendQQMsg("测试文本")
    // sendEmail("测试主题", "测试文本", null)
    // sendServerChan(测试主题, 测试文本)
    // sendPushDeer(测试主题, 测试文本)
})

toastLog("监听中, 请在日志中查看记录的通知及其内容")

// ======================== 打卡流程 ============================

/**
 * @description 打卡流程
 */
function doClock() {
    console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
    console.log("开始打卡流程!")

    brightScreen() // 唤醒屏幕
    unlockScreen() // 解锁屏幕
    holdOn() // 随机等待
    let k = signIn() // 自动登录
    attendKaoqin(k) // 考勤打卡
    lockScreen()
}

// ================ 监听内容 ====================
function notificationHandler(n) {
    log("应用包名: " + n.getPackageName())
    log("通知文本: " + n.getText())
    log("通知优先级: " + n.priority)
    log("通知目录: " + n.category)
    log("通知时间: " + new Date(n.when))
    log("通知数: " + n.number)
    log("通知摘要: " + n.tickerText)
    var packageId = n.getPackageName() // 获取通知包名
    var abstract = n.tickerText // 获取通知摘要
    let category = n.category // 通知目录 一般为alarm
    var text = n.getText() // 获取通知文本

    // 过滤 PackageId 白名单之外的应用所发出的通知
    if (!filterNotification(packageId, abstract, text)) {
        return
    }

    // 监听摘要为 "定时打卡" 的通知, 不一定要从 Tasker 中发出通知, 日历、定时器等App均可实现
    //手机不显示‘定时打卡’只能监听通知包名
    if ((text == "定时打卡" || category == "alarm") && !suspend) {
        needWaiting = true
        oppo()

        threads.shutDownAll()
        threads.start(function () {
            doClock()
        })
    }

    switch (text) {
        case "打卡": // 监听文本为 "打卡" 的通知
            needWaiting = false
            threads.shutDownAll()
            threads.start(function () {
                doClock()
            })
            break

        case "查询": // 监听文本为 "查询" 的通知
            threads.shutDownAll()
            threads.start(function () {
                sendQQMsg(getStorageData("dingding", "clockResult"))
            })
            break

        case "暂停": // 监听文本为 "暂停" 的通知
            suspend = true
            console.warn("暂停定时打卡")
            threads.shutDownAll()
            threads.start(function () {
                sendQQMsg("修改成功, 已暂停定时打卡功能")
            })
            break

        case "恢复": // 监听文本为 "恢复" 的通知
            suspend = false
            console.warn("恢复定时打卡")
            threads.shutDownAll()
            threads.start(function () {
                sendQQMsg("修改成功, 已恢复定时打卡功能")
            })
            break

        default:
            break
    }
    if (text == null) return

    // 监听钉钉返回的考勤结果
    if (packageId == PACKAGE_ID.DD && text.indexOf("考勤打卡") != -1) {
        text = text.indexOf("]") ? text.slice(text.indexOf("]") + 1) : text
        setStorageData("dingding", "clockResult", text)
        sleep(6000)
        threads.shutDownAll()
        threads.start(function () {
            sendQQMsg(text)
        })
        return
    }
}
//——————————函数

/**
 * @description 发送QQ消息
 * @param {string} message 消息内容
 */
function sendQQMsg(message) {
    //第一步要先退出钉钉的打卡界面，所以判断是否还在钉钉的界面，返回到桌面，重复太多次进入钉钉打卡界面会卡死
    if (isInKaoqing()) {
        console.log("退出钉钉的打卡界面")
        sleep(2000)
        backHome()
        sleep(1000)
    }
    console.log("发送QQ消息")

    brightScreen() // 唤醒屏幕
    unlockScreen() // 解锁屏幕

    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + QQ,
        packageName: "com.tencent.mobileqq",
    })

    // waitForActivity("com.tencent.mobileqq.activity.SplashActivity")

    id("input").findOne().setText(message)
    id("fun_btn").findOne().click()

    sleep(1000)
    home()
    sleep(1000)
    lockScreen() // 关闭屏幕
}

/**
 * @description 唤醒设备
 */
function brightScreen() {
    console.log("唤醒设备")

    device.setBrightnessMode(0) // 手动亮度模式
    device.setBrightness(SCREEN_BRIGHTNESS)
    device.wakeUpIfNeeded() // 唤醒设备
    device.keepScreenOn() // 保持亮屏
    sleep(1000) // 等待屏幕亮起

    if (!device.isScreenOn()) {
        console.warn("设备未唤醒, 重试")
        device.wakeUpIfNeeded()
        brightScreen()
    } else {
        console.info("设备已唤醒")
    }
    sleep(1000)
}

/**
 * @description 解锁屏幕
 */

function unlockScreen() {
    console.log("解锁屏幕")

    if (isDeviceLocked()) {
        gesture(
            320, // 滑动时间：毫秒
            [
                device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
                device.height * 0.9, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
            ],
            [
                device.width / 2, // 滑动终点 x 坐标：屏幕宽度的一半
                device.height * 0.1, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
            ]
        )

        sleep(1000) // 等待解锁动画完成
        home()
        sleep(1000) // 等待返回动画完成
    }

    if (isDeviceLocked()) {
        console.error("上滑解锁失败, 请按脚本中的注释调整 gesture(time, [x1,y1], [x2,y2]) 方法的参数!")
        return
    }
    console.info("屏幕已解锁")
}

/**
 * @description 随机等待
 */
function holdOn() {
    if (!needWaiting) {
        return
    }
    var randomTime = random(LOWER_BOUND, UPPER_BOUND)
    toastLog(Math.floor(randomTime / 1000) + "秒后启动" + app.getAppName(PACKAGE_ID.DD) + "...")
    sleep(randomTime)
}

/**
 * @description 启动并登陆钉钉
 */
function signIn() {
    setVolume(0) // 设备静音
    let count = 1
    do {
        console.warn(`第${count}次登录...`)
        app.launchPackage(PACKAGE_ID.DD)
        console.log("正在启动" + app.getAppName(PACKAGE_ID.DD) + "...")

        sleep(5000) // 等待钉钉启动

        if (!isLogin()) {
            console.info("账号未登录")

            var account = id("et_phone_input").findOne()
            account.setText(ACCOUNT)
            console.log("输入账号")

            var password = id("et_password").findOne()
            password.setText(PASSWORD)
            console.log("输入密码")

            var privacy = id("cb_privacy").findOne()
            privacy.click()
            console.log("同意隐私协议")

            var btn_login = id("btn_next").findOne()
            btn_login.click()
            console.log("正在登陆...")
            sleep(10000)
        }
        if (!isInKaoqing()) {
            console.info("账号已登录")
            sleep(1000)
            return true
        } else {
            console.error("连接错误,重新登录!")
            sleep(2000)
            backHome()
            sleep(1000)
            count += 1
            continue
        }
    } while (count < 6)
    return false
}

/**
 * @description 使用 URL Scheme 进入考勤界面
 */
function attendKaoqin(key) {
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

/**
 * @description 锁屏
 */
function lockScreen() {
    console.log("关闭屏幕")
    device.setBrightnessMode(1) // 自动亮度模式
    device.cancelKeepingAwake() // 取消设备常亮
    sleep(10000)
    // 锁屏方案1：Root
    Power()

    // 锁屏方案2：No Root
    // press(Math.floor(device.width / 2), Math.floor(device.height * 0.973), 1000) // 小米的快捷手势：长按Home键锁屏

    // 万能锁屏方案：向Tasker发送广播, 触发系统锁屏动作。配置方法见 2021-03-09 更新日志
    // app.sendBroadcast({ action: ACTION_LOCK_SCREEN })

    if (isDeviceLocked()) {
        console.info("屏幕已关闭")
    } else {
        console.error("屏幕未关闭, 请尝试其他锁屏方案, 或等待屏幕自动关闭")
    }
}

// ===================== ↓↓↓ 功能函数 ↓↓↓ =======================

function dateDigitToString(num) {
    return num < 10 ? "0" + num : num
}

function getCurrentTime() {
    var currentDate = new Date()
    var hours = dateDigitToString(currentDate.getHours())
    var minute = dateDigitToString(currentDate.getMinutes())
    var second = dateDigitToString(currentDate.getSeconds())
    var formattedTimeString = hours + ":" + minute + ":" + second
    return formattedTimeString
}

function getCurrentDate() {
    var currentDate = new Date()
    var year = dateDigitToString(currentDate.getFullYear())
    var month = dateDigitToString(currentDate.getMonth() + 1)
    var date = dateDigitToString(currentDate.getDate())
    var week = currentDate.getDay()
    var formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

// 通知过滤器
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

// 删除本地数据
function delStorageData(name, key) {
    const storage = storages.create(name)
    if (storage.contains(key)) {
        storage.remove(key)
    }
}

// 屏幕是否为锁定状态
function isDeviceLocked() {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    var km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
}

// 设置媒体和通知音量
function setVolume(volume) {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    console.verbose("媒体音量:" + device.getMusicVolume())
    console.verbose("通知音量:" + device.getNotificationVolume())
}

// 返回再退出到home
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

// 判断是否登录钉钉
function isLogin() {
    return currentPackage() == PACKAGE_ID.DD &&
        currentActivity() == "com.alibaba.android.user.login.SignUpWithPwdActivity"
        ? false
        : true
}
// 判断是否在考勤界面
function isInKaoqing() {
    if (
        currentPackage() == PACKAGE_ID.DD &&
        textContains("申请").findOne(40000) &&
        textContains("打卡").findOne(40000) &&
        textContains("统计").findOne(40000) &&
        textContains("设置").findOne(40000)
    ) {
        return true
    }
    return false
}

//自动跳过OPPO的闹铃，进入home界面
function oppo() {
    if (currentPackage() == "com.android.alarmclock") {
        let btn_close = id("el").findOne()
        btn_close.click()
        toast("关闭闹钟")
    }
    sleep(1000)
}
