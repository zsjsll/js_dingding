import {
    brightScreen,
    isDeviceLocked,
    backHome,
    setVolume,
    unlockScreen,
    UnLockScreen,
    resetPhone,
    lockScreen,
} from "@/tools"
import { Cfg } from "./config"

export type PhoneCfg = {
    DEV: boolean
    SCREEN_BRIGHTNESS: number
    UNLOCKSCREEN: UnLockScreen
    VOLUME: number
    PACKAGE_ID_LIST: Phone_Package_Id_List
}

type Phone_Package_Id_List = {
    HOME: string
}

export class Phone implements PhoneCfg {
    DEV: boolean
    SCREEN_BRIGHTNESS: number
    UNLOCKSCREEN: UnLockScreen
    VOLUME: number
    PACKAGE_ID_LIST: Phone_Package_Id_List

    constructor(cfg: Cfg) {
        this.DEV = cfg.DEV
        this.SCREEN_BRIGHTNESS = cfg.SCREEN_BRIGHTNESS
        this.UNLOCKSCREEN = cfg.UNLOCKSCREEN
        this.VOLUME = cfg.VOLUME
        this.PACKAGE_ID_LIST = cfg.PACKAGE_ID_LIST
    }

    turnOn() {
        if (this.DEV) this.SCREEN_BRIGHTNESS = -1

        if (!brightScreen(this.SCREEN_BRIGHTNESS)) {
            console.error("唤醒设备失败!")
            return false
        }
        sleep(500)
        if (isDeviceLocked()) {
            console.log("解锁屏幕")
            unlockScreen(this.UNLOCKSCREEN)
            if (isDeviceLocked()) {
                console.error("上滑解锁失败, 请按脚本中的注释调整UNLOCKSCREEN中的 key[TIME, START, END] 的参数!")
                return false
            }
        }
        console.info("屏幕已解锁")
        setVolume(this.VOLUME)
        backHome(this.PACKAGE_ID_LIST.HOME)
        return true
    }

    turnOff() {
        backHome(this.PACKAGE_ID_LIST.HOME)
        if (this.DEV) resetPhone()
        sleep(2000)
        console.log("关闭屏幕")
        lockScreen()
        if (isDeviceLocked()) {
            console.info("屏幕已关闭")
            return true
        }
        console.error("屏幕未关闭, 请尝试其他锁屏方案, 或等待屏幕自动关闭")
        return false
    }
}
