import { resetPhone } from "@/tools"

export interface ListenerCfg {
    OBSERVE_VOLUME_KEY: boolean
}

export class Listener implements ListenerCfg {
    constructor(listenerCfg: ListenerCfg) {
        this.OBSERVE_VOLUME_KEY = listenerCfg.OBSERVE_VOLUME_KEY
    }
    OBSERVE_VOLUME_KEY: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bindVolumeKey(func?: (...args: any[]) => unknown) {
        events.setKeyInterceptionEnabled("volume_down", this.OBSERVE_VOLUME_KEY)
        events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY)
        if (this.OBSERVE_VOLUME_KEY) {
            events.observeKey()
        }
        const doSomething =
            () =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (...args: any[]) => {
                resetPhone()
                threads.shutDownAll()
                toastLog("按下音量键,已中断所有子线程!")
                /* 调试脚本*/
                if (func === undefined) return
                else return func(...args)
            }

        // 监听音量+键
        events.onKeyDown("volume_up", doSomething())
        // 监听音量-键
        events.onKeyDown("volume_down", doSomething())
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
