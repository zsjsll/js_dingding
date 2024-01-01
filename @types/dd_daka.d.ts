declare type Config = {
    ACCOUNT: string
    PASSWD: string
    QQ: string
    CORP_ID?: string

    SCREEN_BRIGHTNESS: Screen_brightness
    VOLUME: Volume
    OBSERVE_VOLUME_KEY: boolean
    OPEN_NOTIFICATIONS_FILTER: Filter_switch
    DELAY: Delay

    PACKAGE_ID_LIST: Package_id_list

    GLOBAL_LOG_FILE_DIR: string
}

declare type Package_id_list = {
    QQ: Package_id
    DD: Package_id
    XMSF: Package_id
    TASKER?: Package_id
    EMAIL: Package_id
    CLOCK: Package_id
    HOME: Package_id
}

declare type Filter_switch = boolean
declare type Volume = number
declare type Package_id = string
declare type Screen_brightness = string
declare type Delay = number
