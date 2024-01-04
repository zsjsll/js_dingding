module.exports = { printInfo, listenMsg, listenClock }

/**
 *
 *
 * @param {org.autojs.autojs.core.notification.Notification} notification
 */
function printInfo(notification) {
    console.verbose("应用包名: " + notification.getPackageName())
    console.verbose("通知文本: " + notification.getText())
    console.verbose("通知优先级: " + notification.priority)
    console.verbose("通知目录: " + notification.category)
    console.verbose("通知时间: " + new Date(notification.when))
    console.verbose("通知数: " + notification.number)
    console.verbose("通知摘要: " + notification.tickerText)
}

/**
 *
 *
 * @param {Function} QQ
 * @param {Function} DD
 * @param {org.autojs.autojs.core.notification.Notification} notification
 * @param {Config} config
 */

function listenMsg(notification, QQ, DD, config) {
    switch (notification.getText()) {
        case "帮助":
            threads.shutDownAll()
            threads.start(() =>
                QQ(
                    "帮助: 显示所有指令内容\n打卡: 马上打卡\n暂停: 停止打卡动作\n恢复: 恢复打卡动作\n锁屏: 停止当前动作后锁屏"
                )
            )
            break
        case "打卡":
            threads.shutDownAll()
            threads.start(() => DD(-1))
            break

        case "暂停":
            config.pause = true
            console.info("暂停定时打卡")
            threads.shutDownAll()
            threads.start(() => QQ("修改成功, 已暂停定时打卡功能"))
            break

        case "恢复":
            config.pause = false
            console.info("恢复定时打卡")
            threads.shutDownAll()
            threads.start(() => QQ("修改成功, 已恢复定时打卡功能"))
            break

        case "锁屏":
            console.info("恢复初始化")
            threads.shutDownAll()
            require("./tools").backHome()
            require("./tools").lockScreen()
            break

        default:
            break
    }
}

function listenClock(notification) {
    // TODO
}
