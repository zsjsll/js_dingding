import { resetPhone } from "@/tools"
import _ from "lodash"
export interface ListenerCfg {
    OBSERVE_VOLUME_KEY: boolean
}

export class Listener implements ListenerCfg {
    constructor(listenerCfg: ListenerCfg) {
        this.OBSERVE_VOLUME_KEY = listenerCfg.OBSERVE_VOLUME_KEY
    }
    OBSERVE_VOLUME_KEY: boolean

    listenVolumeKey(func?: (e: android.view.KeyEvent) => unknown) {
        events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY)
        events.setKeyInterceptionEnabled("volume_down", this.OBSERVE_VOLUME_KEY)
        if (this.OBSERVE_VOLUME_KEY) events.observeKey()

        const doSomething = (e: android.view.KeyEvent) => {
            threads.shutDownAll()
            resetPhone()
            toastLog("按下音量键,已中断所有子线程!")
            /* 调试脚本*/
            if (typeof func === "function") return func(e)
            else return
        }
        // FIX:需要节流
        events.onKeyDown("volume_up", doSomething)
        events.onKeyDown("volume_down", doSomething)
    }

    listenNotification() {
        events.observeNotification()

        events.on("notification", (n: org.autojs.autojs.core.notification.Notification) => {
            console.verbose("应用包名: " + n.getPackageName())
            console.verbose("通知文本: " + n.getText())
            console.verbose("通知优先级: " + n.priority)
            console.verbose("通知目录: " + n.category)
            console.verbose("通知时间: " + new Date(n.when))
            console.verbose("通知数: " + n.number)
            console.verbose("通知摘要: " + n.tickerText)
            // FIX:需要节流
            events.emit("info", "测试")
        })
    }
}
