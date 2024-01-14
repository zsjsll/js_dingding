import { QQ, DD, QQCfg } from "@/app"
import { Listener, ListenerCfg } from "@/listener"
import { config } from "@/config"
import { Init } from "@/init"

const qq_config: QQCfg = {
    PACKAGE_ID_LIST: {
        QQ: config.PACKAGE_ID_LIST.QQ,
        HOME: config.PACKAGE_ID_LIST.HOME,
    },
    QQ: "124119885",
}

const qq = new QQ(qq_config)
// qq.openAndSendMsg()

const aa: ListenerCfg = {
    OBSERVE_VOLUME_KEY: true,
    NOTIFICATIONS_FILTER: true,
    PACKAGE_ID_LIST: { QQ: config.PACKAGE_ID_LIST.QQ, HOME: config.PACKAGE_ID_LIST.HOME },
}
const cc = config

const init = new Init(cc, "test")
const t = init.setConfig()
console.log(t)

// init.setlog()
