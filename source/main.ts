import { QQ, DD } from "./module/app"
import { config } from "./module/config"



const qq = new QQ(config.PACKAGE_ID_LIST.HOME, "com.tencent.tim", "124119885")
const dd = new DD(config.PACKAGE_ID_LIST.HOME, config.PACKAGE_ID_LIST.DD, config.ACCOUNT, config.PASSWD)
dd.openAndPunchIn()