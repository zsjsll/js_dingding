module.exports = { bindVolumeKey, listener }

/**
 *
 *
 * @param {Config} config
 */
function bindVolumeKey(config) {
    events.setKeyInterceptionEnabled("volume_down", config.OBSERVE_VOLUME_KEY)
    events.setKeyInterceptionEnabled("volume_up", config.OBSERVE_VOLUME_KEY)
    if (config.OBSERVE_VOLUME_KEY) {
        events.observeKey()
    }

    // 监听音量-键
    events.onKeyDown("volume_down", doSomething)
    // 监听音量+键
    events.onKeyDown("volume_up", doSomething)

    const doSomething = () => {
        require("./tools").resetPhone()
        threads.shutDownAll()
        toast("已中断所有子线程!")
        /* 调试脚本*/
    }
}

/**
 *
 *
 * @param {org.autojs.autojs.core.notification.Notification} notification
 */
function printInfo(notification) {
    console.verbose("应用包名: " + n.getPackageName())
    console.verbose("通知文本: " + n.getText())
    console.verbose("通知优先级: " + n.priority)
    console.verbose("通知目录: " + n.category)
    console.verbose("通知时间: " + new Date(n.when))
    console.verbose("通知数: " + n.number)
    console.verbose("通知摘要: " + n.tickerText)
}



function listenClock(notification){
    // TODO
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

/**
 *
 *
 * @param {Function} QQ
 * @param {Function} DD
 * @param {Config} config
 */
function listener(QQ, DD, config) {
    events.observeNotification()
    events.onNotification((n) => {
        printInfo(n)

        listenMsg(n, QQ, DD, config)
    })
}
