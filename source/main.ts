import { QQ, DD, QQCfg } from "@/app"
import { Listener, ListenerCfg } from "@/listener"
import { config, Config } from "@/config"


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



const c = new Config()
c.createJsonFile()
// c.get()
