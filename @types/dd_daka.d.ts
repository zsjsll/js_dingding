declare interface Config {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID: string

    SCREEN_BRIGHTNESS: number
    OBSERVE_VOLUME_KEY: Boolean
    OPEN_NOTIFICATIONS_FILTER: Open_filter
    DELAY: number

    PACKAGE_ID_LIST: Package_id_list

    GLOBAL_LOG_FILE_DIR: string
}

declare interface Package_id_list {
    QQ: string
    DD: string
    XMSF: string
    TASKER: string
    EMAIL: string
    CLOCK: string
    HOME: string
}

declare type White_list = Package_id_list

