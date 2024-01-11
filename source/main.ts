import { QQ, DD, QQCfg } from "@/app"
import { config } from "@/config"

const qq_config: QQCfg = {
    PACKAGE_ID_LIST: {
        QQ: config.PACKAGE_ID_LIST.QQ,
        HOME: config.PACKAGE_ID_LIST.HOME,
    },
    QQ: "124119885",
}

const qq = new QQ(qq_config)
qq.openAndSendMsg()
