import { auto } from "./tools"
import { PhoneCfg, SwipeScreen } from "@/types"

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
    if (!auto.brightScreen(screen_brightness)) {
      console.error("唤醒设备失败!")
      return false
    }
    sleep(500)
    if (auto.isDeviceLocked()) {
      console.log("解锁屏幕")
      auto.swipeScreen(this.SWIPESCREEN)
      if (auto.isDeviceLocked()) {
        console.error("上滑解锁失败, 请按脚本中的注释调整UNLOCKSCREEN中的 key[TIME, START, END] 的参数!")
        return false
      }
    }
    console.info("屏幕已解锁")
    auto.setVolume(this.VOLUME)
    auto.backHome(this.PACKAGESNAME.HOME)
    auto.openWifi()
    return true
  }

  turnOff() {
    auto.backHome(this.PACKAGESNAME.HOME)
    if (this.DEV) auto.resetPhone()
    console.log("关闭屏幕")
    for (let i = 0; i < 10; i++) {
      auto.closeScreen()
      if (!device.isScreenOn()) {
        console.info("屏幕已关闭")
        return true
      }
    }
    console.error("需root权限或Android 9 以上版本,等待屏幕自动关闭")
    return false
  }
}
