declare interface Config {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID: string

    SCREEN_BRIGHTNESS: number
    OBSERVE_VOLUME_KEY: Boolean
    OPEN_NOTIFICATIONS_FILTER: Boolean
    DELAY: number

    PACKAGE_ID: White_list

    GLOBAL_LOG_FILE_DIR: string
}

declare interface White_list {
    QQ: string
    DD: string
    XMSF: string
    TASKER: string
    EMAIL: string
    CLOCK: string
    HOME: string
}
