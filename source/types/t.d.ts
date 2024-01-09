declare type Config = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string

    UNLOCKSCREEN: Unlockscreen

    SCREEN_BRIGHTNESS: number
    OBSERVE_VOLUME_KEY: boolean
    NOTIFICATIONS_FILTER: boolean

    DELAY: number
    RETRY: number

    PACKAGE_ID_LIST: Package_id_list

    GLOBAL_LOG_FILE_DIR: string
    DEV: boolean

    pause: boolean
}

declare type Packages = "QQ" | "DD" | "XMSF" | "CLOCK" | "HOME"

declare type Package_id_list = { [key in Packages]: Package_id }

declare type Package_id = string

declare type Unlockscreen = {
    T: number
    Y1: number
    Y2: number
}

declare type Function_list = {
    [key: number]: Function
}
