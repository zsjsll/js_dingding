import { Cfg } from "@/config"
import { getCurrentDate, getStorageData, setStorageData } from "@/tools"

export type BASE_CONFIG = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string
}

class Dialogs {
    D_change: Dialogs.JsDialog
    D_account: Dialogs.JsDialog
    D_passwd: Dialogs.JsDialog
    D_qq: Dialogs.JsDialog
    D_corp_id: Dialogs.JsDialog
    constructor() {
        this.D_change = dialogs.build({
            title: "是否修改信息?",
            positive: "是",
            negative: "否",
            cancelable: false,
        })
        this.D_account = dialogs.build({
            inputHint: "12312312",
            positive: "是",
            negative: "否",
        })
    }
}
export class Init extends Dialogs {
    cfg: Cfg
    db_name: string
    constructor(cfg: Cfg, db_name: string) {
        super()
        this.cfg = cfg
        this.db_name = db_name
    }

    setConfig() {
        this.D_change.show()
        setTimeout(() => {
            this.D_change.dismiss()
        }, 3000)
        // let base_config: BASE_CONFIG
        // base_config.ACCOUNT = getStorageData(this.db_name, "ACCOUNT")
    }
    setlog() {
        auto()
        // 创建运行日志
        // console.setGlobalLogConfig({ file: this.cfg.GLOBAL_LOG_FILE_PATH })
    }
}

// TODO
