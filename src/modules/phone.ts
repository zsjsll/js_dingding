import type { PhoneCfg, SwipeScreen } from "@/types"
import { ctrl } from "./tools"

export default class Phone {
  private readonly DEV: boolean
  private readonly SCREEN_BRIGHTNESS: number
  private readonly SWIPESCREEN: SwipeScreen
  private readonly VOLUME: number
  private readonly PACKAGESNAME: { HOME: string }

  constructor(cfg: PhoneCfg) {
    this.DEV = cfg.DEV
    this.SCREEN_BRIGHTNESS = cfg.SCREEN_BRIGHTNESS
    this.SWIPESCREEN = cfg.SWIPESCREEN
    this.VOLUME = cfg.VOLUME
    this.PACKAGESNAME = { HOME: cfg.PACKAGES.HOME.PACKAGENAME }
  }

  turnOn() {
    const screen_brightness = this.DEV ? -1 : this.SCREEN_BRIGHTNESS
    if (!ctrl.brightScreen(screen_brightness)) {
      console.error("唤醒设备失败!")
      return false
    }
    sleep(500)
    if (ctrl.isDeviceLocked()) {
      console.log("解锁屏幕")
      ctrl.swipeScreen(this.SWIPESCREEN)
      if (ctrl.isDeviceLocked()) {
        console.error("上滑解锁失败, 请按脚本中的注释调整UNLOCKSCREEN中的 key[TIME, START, END] 的参数!")
        return false
      }
    }
    console.info("屏幕已解锁")
    ctrl.setVolume(this.VOLUME)
    ctrl.backHome(this.PACKAGESNAME.HOME)
    ctrl.openSilentMode()
    ctrl.openGPS()
    ctrl.openWifi()
    ctrl.openBluetooth()
    return true
  }

  turnOff() {
    ctrl.backHome(this.PACKAGESNAME.HOME)
    sleep(1000)
    if (this.DEV) ctrl.resetPhone()
    console.log("关闭屏幕")
    for (let i = 0; i < 10; i++) {
      ctrl.closeScreen()
      sleep(1000)
      if (!device.isScreenOn()) {
        console.info("屏幕已关闭")
        return true
      }
    }
    console.error("需root权限或Android 9 以上版本,等待屏幕自动关闭")
    return false
  }
}
