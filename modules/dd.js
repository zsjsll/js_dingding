const backHome = require("./tools").backHome
const startAPP = require("./tools.js").startAPP
module.exports = { openDD, punchIn }

/**
 * 登录钉钉，如果已经登录，false
 *
 * @param {string} account
 * @param {string} passwd
 */
function logining(account, passwd) {
    if (id("cb_privacy").findOne(1e3) !== null) {
        id("et_phone_input").untilFindOne().setText(account)
        id("et_password").untilFindOne().setText(passwd)
        id("cb_privacy").untilFindOne().click()
        id("btn_next").untilFindOne().click()
        return true
    } else return false
}

/**
 * 不进行更新
 *
 */
function noUpdate() {
    const noupdate = text("暂不更新").findOne(10e3)
    if (noupdate !== null) {
        noupdate.click()
        return true
    } else return false
}

/**
 * 强制回到app的home界面
 *
 */
function atAPPHome() {
    const message = id("home_app_item").indexInParent(0).findOne(1e3)
    if (message !== null) {
        message.click()
        return true
    } else return false
}

/**
 * 启动并登录钉钉
 *
 * @param {number} count 重试次数
 * @param {Package_id} dd_package_id
 * @param {string} account
 * @param {string} passwd
 */
function openDD(count, dd_package_id, account, passwd) {
    for (let index = 1; index <= count; index++) {
        console.info(`第${index}次登录...`)
        backHome()
        console.log("正在启动" + app.getAppName(dd_package_id) + "...")
        const is_run = startAPP(dd_package_id)
        if (!is_run) {
            console.warn("启动失败，重新启动...")
            continue
        }
        const is_logining = logining(account, passwd)
        if (is_logining) console.log("正在登录...")
        else console.log("可能已登录")

        const is_reject = noUpdate()
        if (is_reject) console.info("取消更新")
        else console.log("无更新消息")

        const is_at_APP_home = atAPPHome()
        sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
        if (is_at_APP_home) return true
        else console.warn("登录失败,重试...")
    }
    console.error(`重试${count}次,登录失败!`)
    return false
}
// FIX :msg变量没有使用，没有声明
/**
 *
 *
 * @param {number} count 重试次数
 * @param {Package_id} dd_package_id
 * @param {string} account
 * @param {string} passwd
 * @param {string} corp_id 企业的ID
 */
function punchIn(count, dd_package_id, account, passwd, corp_id) {
    const u = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
    const url = corp_id === "" ? u : `${u}?corpId=${corp_id}`
    const a = app.intent({
        action: "VIEW",
        data: url,
        //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
    })
    for (let index = 1; index <= count; index++) {
        console.info(`第${index}次尝试打卡...`)
        app.startActivity(a)
        console.log("正在进入考勤界面...")
        if (text("申请").findOne(15e3 === null)) {
            console.error("连接错误,重新进入考勤界面!")
            back()
            continue
        }
        console.log("已进入考勤界面")
        console.log("等待连接到考勤机...")
        if (textContains("考勤").findOne(15e3) === null) {
            console.error("不符合打卡规则,重新进入考勤界面!")
            back()
            continue
        }
        console.info("可以打卡")
        let btn =
            text("上班打卡").clickable(true).findOnce() ||
            text("下班打卡").clickable(true).findOnce() ||
            text("迟到打卡").clickable(true).findOnce()
        if (btn === null) {
            click(device.width / 2, device.height * 0.56)
            console.log("点击打卡按钮坐标")
        } else {
            btn.click()
            console.log("按下打卡按钮")
        }
        if (textContains("成功").findOne(15e3) === null) {
            msg = `考勤打卡:${getCurrentTime()}打卡·无效\n也许未到打卡时间`
            console.warn("打卡无效,也许未到打卡时间!")
            return false
        }
        msg = `考勤打卡:${getCurrentTime()}打卡·成功\n但未收到成功消息`
        console.info("打卡成功!")
        return true
    }
    console.error(`重试${count}次,打卡失败!`)
    return false
}
