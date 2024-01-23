import { QQ, DD } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { includes } from "lodash"
;(function main() {
    auto()
    VolumeDown()
    const config = new Config()
    const cfg = config.createJsonFile()
    config.createLog()
    config.information(cfg)

    const qq = new QQ(cfg)
    const dd = new DD(cfg)
    const phone = new Phone(cfg)

    const listener = new Listener(cfg)
    listener.listenVolumeKey()
    listener.listenNotification((notification) => {
        listenQQ(notification)
        listenClock(notification)
        listenDD(notification)
    })

    function listenQQ(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.QQ) return
        switch (n.getText()) {
            case "帮助":
                threads.shutDownAll()
                threads.start(() => {
                    phone.turnOn()
                    qq.openAndSendMsg(
                        "帮助: 显示所有指令内容\n打卡: 马上打卡\n暂停: 停止自动打卡\n恢复: 恢复自动打卡\n锁屏: 停止当前动作后锁屏"
                    )
                    phone.turnOff()
                })
                break
            case "打卡":
                threads.shutDownAll()
                threads.start(() => {
                    phone.turnOn()
                    cfg.msg = dd.openAndPunchIn(-1)
                    qq.openAndSendMsg(cfg.msg)
                    phone.turnOff()
                })
                break
            case "暂停":
                cfg.pause = true
                console.info("暂停定时打卡")
                threads.shutDownAll()
                threads.start(() => {
                    phone.turnOn()
                    qq.openAndSendMsg("修改成功, 已暂停定时打卡功能")
                    phone.turnOff()
                })
                break
            case "恢复":
                cfg.pause = false
                console.info("恢复定时打卡")
                threads.shutDownAll()
                threads.start(() => {
                    phone.turnOn()
                    qq.openAndSendMsg("修改成功, 已恢复定时打卡功能")
                    phone.turnOff()
                })
                break
            case "锁屏":
                console.info("停止当前动作")
                threads.shutDownAll()
                threads.start(() => {
                    phone.turnOn()
                    qq.openAndSendMsg("已停止当前动作")
                    phone.turnOff()
                })
                break
            default:
                break
        }
    }
    function listenClock(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
        if (cfg.pause) {
            console.warn("已暂停打卡!")
            return
        }
        let timer = cfg.DELAY
        if (!includes(n.getText(), "已错过")) {
            n.click()
            const btn_close = id(cfg.PACKAGE_ID_LIST.CLOCK + ":id/el").findOne(2e3)
            if (btn_close !== null) {
                btn_close.click()
                console.log("关闭闹钟")
            }
        } else {
            console.warn("未捕获信息!开启快速打卡")
            timer = 1
        }

        threads.shutDownAll()
        threads.start(() => {
            phone.turnOn()
            cfg.msg = dd.openAndPunchIn(timer)
            qq.openAndSendMsg(cfg.msg)
            phone.turnOff()
        })
    }

    function listenDD(n: org.autojs.autojs.core.notification.Notification) {
        if (n.getPackageName() !== cfg.PACKAGE_ID_LIST.DD) return
        if (!includes(n.getText(), "考勤打卡")) return
        cfg.msg = n.getText().replace(/^\[.+?\]/, "")

        setTimeout(() => {
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(cfg.msg)
                phone.turnOff()
            })
        }, 1000) //等待，这样可以打断锁屏，并且让console.log()输出完整

        return
    }
})()
