declare interface Config {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID: string

    SCREEN_BRIGHTNESS: number
    OBSERVE_VOLUME_KEY: boolean
    OPEN_NOTIFICATIONS_FILTER: Filter_switch
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
declare type Filter_switch = boolean
