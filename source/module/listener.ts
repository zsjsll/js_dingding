function bindVolumeKey(config) {
    events.setKeyInterceptionEnabled("volume_down", config.OBSERVE_VOLUME_KEY)
    events.setKeyInterceptionEnabled("volume_up", config.OBSERVE_VOLUME_KEY)
    if (config.OBSERVE_VOLUME_KEY) {
        events.observeKey()
    }

    // 监听音量+键
    events.onKeyDown("volume_up", doSomething)
    // 监听音量-键
    events.onKeyDown("volume_down", doSomething)

    function doSomething() {
        require("./tools").resetPhone()
        threads.shutDownAll()
        toastLog("按下音量键,已中断所有子线程!")
        /* 调试脚本*/
    }
}



function listener(function_list) {
    events.observeNotification()

    events.onNotification((n) => {
        function_list.forEach((element) => {
            console.log(function_list[element])
            element(n)
        })
    })
}

// TODO