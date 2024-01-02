const backHome = require("./tools").backHome
const isFindSelector = require("./tools").isFindSelector

module.exports = {}

function startAPP(package_id) {
    app.launchPackage(package_id)
    console.log("正在启动" + app.getAppName(package_id) + "...")
}

function signIn(account, passwd) {
    id("et_phone_input").untilFind().setText(account)
    id("et_password").untilFind().setText(passwd)
    id("cb_privacy").untilFind().click()
    id("btn_next").untilFind().click()
    // 7.1.17 使用以下代码
    id("et_phone").untilFind().setText(account)
    id("btn_next").untilFind().click()
    id("btn_next").untilFind().click()






    console.log("正在登陆...")
}

function noUpdate() {
    const noupdate = text("暂不更新").findOne(1e3)
    if (noupdate !== null) {
        console.info("取消更新")
        noupdate.click()
    }
}

function isInHome() {
    let message = id("home_app_item").indexInParent(0).findOne(15e3)
    if (message !== null) {
        console.info("账号已登录")
        message.click()
        return true
    }
    return false
}

/**
 *  启动并登陆钉钉
 */
function openDD(account, passwd) {
    let err
    let count = 1
    do {
        console.info(`第${count}次登录...`)
        backHome()
        app.launchPackage(PACKAGE_ID.DD)
        console.log("正在启动" + app.getAppName(PACKAGE_ID.DD) + "...")

        if (!isFindSelector(packageName(PACKAGE_ID.DD).findOne(15e3))) {
            console.warn("启动失败，重新启动...")
            count += 1
            continue
        }

        if (isFindSelector(id("cb_privacy").findOne(1e3))) {
            console.info("账号未登录")
            id("et_phone_input").findOne(-1).setText(account)
            id("et_password").findOne(-1).setText(passwd)
            id("cb_privacy").findOne(-1).click()
            id("btn_next").findOne(-1).click()
            console.log("正在登陆...")
        }

        let noupdate = text("暂不更新").findOne(1e3)
        if (isFindSelector(noupdate)) {
            console.info("发现更新...")
            console.log("取消更新")
            noupdate.click()
        }
        let ele = id("home_app_item").indexInParent(0).findOne(15e3)
        if (isFindSelector(ele)) {
            console.info("账号已登录")
            ele.click()
            sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
            return { status: true, text: "OK" }
        }
        console.warn("登录失败,重试...")
        count += 1
    } while (count < 6)
    err = `重试${count}次,无法登录!`
    console.error(err)
    return { status: false, text: err }
}
