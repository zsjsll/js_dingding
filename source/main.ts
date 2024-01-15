import { QQ, DD } from "@/app"
import { Listener } from "@/listener"
import { Config } from "@/config"
import { Phone } from "@/phone"
import { includes } from "lodash"
;(function main() {
    auto()
    const config = new Config()
    const cfg = config.createJsonFile()
    config.createLog()

    const qq = new QQ(cfg)
    const dd = new DD(cfg)
    const phone = new Phone(cfg)

    const listener = new Listener(cfg)
    listener.listenVolumeKey()
    listener.listenNotification((n) => {
        listenQQ(n)
        listenClock(n)
    })

    function listenQQ(notification: org.autojs.autojs.core.notification.Notification) {
        if (notification.getPackageName() !== cfg.PACKAGE_ID_LIST.QQ) return
        switch (notification.getText()) {
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
                    dd.openAndPunchIn()
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
    function listenClock(notification: org.autojs.autojs.core.notification.Notification) {
        if (notification.getPackageName() !== cfg.PACKAGE_ID_LIST.CLOCK) return
        if (cfg.pause) {
            console.warn("已暂停打卡!")
            return
        }
        threads.shutDownAll()
        if (notification.getText().includes("已错过")) return
        sleep(1e3)
        notification.click()

        const btn_close = id(cfg.PACKAGE_ID_LIST.CLOCK + ":id/el").findOne(15e3)
        if (btn_close === null) return
        btn_close.click()
        console.log("关闭闹钟")

        sleep(1e3)
        threads.start(() => {
            console.log("开始打卡")
            phone.turnOn()
            cfg.msg = dd.openAndPunchIn()
            phone.turnOff()
        })
    }

    function listenDD(notification: org.autojs.autojs.core.notification.Notification) {
        const n = notification.getPackageName()
        if (n !== cfg.PACKAGE_ID_LIST.DD) return
        if (!n.includes("考勤打卡")) return
        // const format = (s: string) => (s.includes("]") ? s.slice(s.indexOf("]") + 1) : s)
        const text = n.replace(/\[.*?\]/, "")
// TODO
        setTimeout(() => {
            threads.shutDownAll()
            threads.start(() => {
                phone.turnOn()
                qq.openAndSendMsg(text)
                phone.turnOff()
            })
        }, 1000) //等待，这样可以打断锁屏，并且让console.log()输出完整

        return
    }
})()
