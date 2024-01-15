import { resetPhone, isInWhiteList } from "@/tools"
import {} from "@/tools"
import { forIn } from "lodash"
import { Cfg } from "./config"

export type ListenerCfg = {
    OBSERVE_VOLUME_KEY: boolean
    NOTIFICATIONS_FILTER: boolean
    PACKAGE_ID_LIST: White_list
}

type White_list = {
    [k: string]: string
}

type Info = {
    PACKAGENAME: string
    TEXT: string
    PRIORITY: number
    CATEGORY: string
    TIME: Date
    NUMBER: number
    TICKER_TEXT: string
}

export class Listener implements ListenerCfg {
    constructor(cfg: Cfg) {
        this.OBSERVE_VOLUME_KEY = cfg.OBSERVE_VOLUME_KEY
        this.NOTIFICATIONS_FILTER = cfg.NOTIFICATIONS_FILTER
        this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
    }
    PACKAGE_ID_LIST: White_list
    NOTIFICATIONS_FILTER: boolean
    OBSERVE_VOLUME_KEY: boolean

    listenVolumeKey(func?: (e: android.view.KeyEvent) => unknown) {
        events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY)
        events.setKeyInterceptionEnabled("volume_down", this.OBSERVE_VOLUME_KEY)
        if (this.OBSERVE_VOLUME_KEY) events.observeKey()

        events.on("key", (keycode: number, event: android.view.KeyEvent) => {
            if ((keycode === keys.volume_up || keycode === keys.volume_down) && event.getAction() === 0) {
                threads.shutDownAll()
                resetPhone()
                toastLog("按下音量键,已中断所有子线程!")
                /* 调试脚本*/
                if (typeof func === "function") return func(event)
                else return
            }
        })
    }

    listenNotification(func?: (notification: org.autojs.autojs.core.notification.Notification) => unknown) {
        events.observeNotification()

        events.on("notification", (n: org.autojs.autojs.core.notification.Notification) => {
            const info: Info = {
                PACKAGENAME: n.getPackageName(),
                TEXT: n.getText(),
                PRIORITY: n.priority,
                CATEGORY: n.category,
                TIME: new Date(n.when),
                NUMBER: n.number,
                TICKER_TEXT: n.tickerText,
            }
            forIn(info, (v, k) => console.verbose(`${k}: ${v}`))
            if (isInWhiteList(this.NOTIFICATIONS_FILTER, this.PACKAGE_ID_LIST, info.PACKAGENAME)) {
                if (typeof func === "function") return func(n)
                else return
            } else return
        })
    }
}
