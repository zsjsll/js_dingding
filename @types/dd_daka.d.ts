declare type Config = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string

    SCREEN_BRIGHTNESS: string
    VOLUME: number
    OBSERVE_VOLUME_KEY: boolean
    OPEN_NOTIFICATIONS_FILTER: boolean
    DELAY: number

    PACKAGE_ID_LIST: Package_id_list

    GLOBAL_LOG_FILE_DIR: string
}

declare type Packages = "QQ" | "DD" | "XMSF" | "TASKER" | "EMAIL" | "CLOCK" | "HOME"

declare type Package_id_list = { [key in Packages]: Package_id }

declare type Package_id = string
