import { resetPhone } from "@/tools"

export interface ListenerCfg {
    OBSERVE_VOLUME_KEY: boolean
}

export class Listener implements ListenerCfg {
    constructor(listenerCfg: ListenerCfg) {
        this.OBSERVE_VOLUME_KEY = listenerCfg.OBSERVE_VOLUME_KEY
    }
    OBSERVE_VOLUME_KEY: boolean

    bindVolumeKey(func?: (e: KeyEvent) => unknown) {
        events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY)
        events.setKeyInterceptionEnabled("volume_down", this.OBSERVE_VOLUME_KEY)
        if (this.OBSERVE_VOLUME_KEY) events.observeKey()

        const doSomething = (e: KeyEvent) => {
            threads.shutDownAll()
            resetPhone()
            toastLog("按下音量键,已中断所有子线程!")
            /* 调试脚本*/
            if (typeof func === "function") return func(e)
            else return
        }

        // 监听音量+键
        events.onKeyDown("volume_up", doSomething)
        // 监听音量-键
        events.onKeyDown("volume_down", doSomething)
    }
}

// function listener(function_list) {
//     events.observeNotification()

//     events.onNotification((n) => {
//         function_list.forEach((element) => {
//             console.log(function_list[element])
//             element(n)
//         })
//     })
// }

// TODO
