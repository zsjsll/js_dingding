/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { forEach, every, find, floor, head, includes, isEmpty, last, parseInt, some, toNumber, isFunction, forIn, toString, throttle, range } from "lodash-es"
import dayjs from "dayjs"
import { SwipeScreen, Delay, Pause, AppPackages, Info, BlackListOptions, Package, XOY } from "@/types"

export const _ = {
  every,
  find,
  floor,
  head,
  includes,
  isEmpty,
  last,
  parseInt,
  some,
  toNumber,
  isFunction,
  throttle,
  forIn,
  toString,
  forEach,
  range,
}

export const decorator = {
  silent: function (): MethodDecorator {
    return (_: unknown, _propertyKey: symbol | string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value as Function
      descriptor.value = function (...args: unknown[]) {
        const originalConsole = { ...console }
        const consoleMethods = ["log", "warn", "error", "info", "verbose"] as const
        forEach(consoleMethods, (v) => {
          console[v] = () => {}
        })
        try {
          return originalMethod.apply(this, args)
        } finally {
          Object.assign(console, originalConsole)
        }
      }
      return descriptor
    }
  },
}

class Ctrl {
  public readonly isRoot: boolean
  constructor() {
    this.isRoot = Tools.isRoot()
  }

  public pressVolumeDown() {
    if (this.isRoot) VolumeDown()
    else console.warn("未root，暂时没有替代的方法，不执行该操作")
  }

  public clickBounds(bounds: android.graphics.Rect | XOY) {
    let xoy: XOY
    if (bounds instanceof android.graphics.Rect) xoy = [bounds.centerX(), bounds.centerY()]
    else xoy = bounds

    if (this.isRoot) Tap(...xoy)
    else click(...xoy)
  }

  public swipeScreen(opt: SwipeScreen) {
    if (this.isRoot) Swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
    else swipe(device.width * 0.5, device.height * opt.START, device.width * 0.5, device.height * opt.END, opt.TIME)
    // gesture(
    //   opt.TIME, // 滑动时间：毫秒 320
    //   [
    //     device.width * 0.5, // 滑动起点 x 坐标：屏幕宽度的一半
    //     device.height * opt.START, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些
    //   ],
    //   [
    //     device.width * 0.5, // 滑动终点 x 坐标：屏幕宽度的一半
    //     device.height * opt.END, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置
    //   ]
    // )

    sleep(1500) // 等待解锁动画完成
  }

  public closeScreen() {
    device.cancelKeepingAwake() // 取消设备常亮
    // if (isRoot()) shell("input keyevent 26", true)
    if (this.isRoot) Power()
    else if (parseInt(device.release) > 9) lockScreen()
    else {
      // console.error("root手机或者提升系统版本9.0以上，还不行的话换手机或者想想其他办法吧！")
    }

    sleep(1e3)
  }

  public openWifi() {
    if (this.isRoot) {
      const wifi_info = shell("settings get global wifi_on", true)
      if (wifi_info.error !== "") console.error("无法获取WiFi信息")
      const r = wifi_info.result
      if (_.includes(r, "0")) console.info("WiFi已关闭，正在打开中...")
      shell("svc wifi enable", true)
    } else console.warn("没有root，请确认已打开WiFi")
  }

  public openBluetooth() {
    if (this.isRoot) {
      const bluetooth_info = shell("settings get global bluetooth_on", true)
      if (bluetooth_info.error !== "") console.error("无法获取Bluetooth信息")
      const r = bluetooth_info.result

      if (_.includes(r, "0")) console.info("Bluetooth已关闭，正在打开中...")
      shell("svc bluetooth enable", true)
    } else console.warn("没有root，请确认已打开Bluetooth")
  }

  public openGPS() {
    if (this.isRoot) {
      const GPS_info = shell("settings get secure location_providers_allowed", true)
      if (GPS_info.error !== "") console.error("无法获取GPS信息")
      const r = GPS_info.result
      if (!_.includes(r, "gps")) console.info("GPS已关闭，正在打开中...")
      shell("settings put secure location_providers_allowed +gps", true)
    } else console.warn("没有root，请确认已打开GPS")
  }

  public openSilentMode() {
    if (this.isRoot) {
      shell("settings put global zen_mode 0", true) //就是这一条起了作用
      shell("settings put global mode_ringer 0", true)
      shell("settings put system vibrate_on 0", true)
      shell("settings put system haptic_feedback_enabled 0", true)
      shell("settings put global notification_vibration 0", true)
    } else console.warn("没有root，请确认已打开静音模式")
  }

  // -----------以上函数需要root权限-----------------
  public resetPhone() {
    // device.setBrightnessMode(1) // 自动亮度模式
    device.setBrightness(600)
    device.cancelKeepingAwake() // 取消设备常亮
  }

  @decorator.silent()
  public backHome(home_id: string) {
    forEach(range(10), (i) => {
      console.info(`按下back键第${i + 1}次...`)
      if (currentPackage() === home_id) return true
      back()
      sleep(50)
      return false
    })
    home()
  }

  public openApp(package_name: string, app_name: string) {
    app.launchPackage(package_name)
    if (packageName(package_name).findOne(5e3)) return true
    else {
      app.launchApp(app_name)
      return !!packageName(package_name).findOne(5e3)
    }
  }

  public brightScreen(brightness: number) {
    device.wakeUpIfNeeded() // 唤醒设备
    if (brightness >= 0) {
      device.keepScreenOn() // 保持亮屏
      device.setBrightnessMode(0) // 手动亮度模式
      device.setBrightness(brightness)
    }
    device.cancelVibration() //取消震动

    return !!device.isScreenOn()
  }

  public isDeviceLocked() {
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    const km = context.getSystemService(Context.KEYGUARD_SERVICE)
    return km.isKeyguardLocked()
  }

  public setVolume(volume: number) {
    device.setMusicVolume(volume)
    device.setNotificationVolume(volume)
    device.setAlarmVolume(volume)
  }
}

class Tools {
  private readonly line: Record<"default" | "warn", string>
  public readonly isRoot: boolean

  constructor() {
    this.line = { default: "-----------------------------", warn: "!+!+!+!+!+!+!+!+!+!+!+!+!+!+!" }
    this.isRoot = Tools.isRoot()
  }

  static isRoot() {
    return !shell("su -v").code
  }

  public reloadScript() {
    const exec_path: string = engines.myEngine().getSource().toString()
    engines.execScriptFile(exec_path)
  }

  public onlyRunOneScript() {
    engines.all().map((ScriptEngine) => {
      if (engines.myEngine().toString() !== ScriptEngine.toString()) {
        ScriptEngine.forceStop()
      }
    })
  }

  public delay([min, max]: Delay = [0, 0]) {
    if (max <= 0 || min >= max) {
      return
    } else {
      const randomTime = random(min * 1e3, max * 1e3)
      toastLog(Math.floor(randomTime / 1000) + "秒后启动程序" + "...")
      sleep(randomTime)
    }
  }

  public passNotification(filter_switch = true, info: Info, app_packages: AppPackages): boolean {
    if (!filter_switch) {
      console.info("√ 放行，过滤未开启")
      return true
    }

    const app_package = _.find(Object.values(app_packages) as Package[], (pkg) => pkg.PACKAGENAME === info.PACKAGENAME)

    if (!app_package) {
      console.warn("× 丢弃，不在包中")
      return false
    }

    if (_.isEmpty(app_package.BLACKLISTS)) {
      console.info("√ 放行，没有黑名单列表")
      return true
    }

    const checkBlackLists = (text: string, blackLists: BlackListOptions[]): boolean =>
      _.some(blackLists, (black_list) => _.every(black_list, (kw) => _.includes(text, kw)))

    // 当有黑名单时，对比通知内容和黑名单列表
    if (checkBlackLists(info.TEXT, app_package.BLACKLISTS as BlackListOptions[])) {
      console.warn("× 丢弃，命中关键词")
      return false
    }

    console.info("√ 放行，没有命中关键词")
    return true
  }

  public setStorageData(name: string, key: string, value: unknown) {
    const storage = storages.create(name) // 创建storage对象
    value ??= ""
    storage.put(key, value)
  }

  public getStorageData(name: string, key: string) {
    const storage = storages.create(name)
    if (storage.contains(key)) {
      return storage.get(key, "")
    }
    // 默认返回undefined
  }

  public formatTime(style: string, timestamp?: number) {
    if (timestamp) return dayjs(timestamp).format(style)
    else return dayjs().format(style)
  }

  public formatPauseInput(input: string): Pause {
    input = "0" + input //在字符串前面添加一个0
    //匹配所有数字，包括小数
    const pause = input.match(/[\d.]+/g)?.map((v) => {
      let num = _.floor(_.toNumber(v)) //变成数字，向下取整
      if (isNaN(num)) num = 1 //判断NaN，如果是 变成1
      return num
    }) ?? [0, 1]

    pause[1] ??= 1 //默认 暂停1次
    pause[0] = pause[1] === 0 ? 0 : pause[0]

    return [pause[0], pause[1]]
  }

  public pauseStatus(pause: Pause) {
    if (pause !== undefined) {
      const [after, count] = pause
      if (count === 0) return []
      else if (after !== 0)
        return [this.line.default, "# 暂停设置 #", `延迟: ${after}次  ( ${after / 2}天 )`, `暂停: ${count}次  ( ${count / 2}天 )`, this.line.default]
      else return [this.line.default, "* 暂停开始 *", `剩余: ${count}次  ( ${count / 2}天 )`, this.line.default]
    }
    return ["好像出错了"]
  }

  public changePause(pause: Pause) {
    if (pause[0] > 0) pause[0] -= 1 //如果有延迟打卡， 延迟打卡减1次
    else if (pause[1] > 0) pause[1] -= 1 //如果没有延迟打卡次数，且有暂停打卡次数， 暂停打卡减1次
    return pause
  }

  public formatNotification(n: org.autojs.autojs.core.notification.Notification): string {
    const text = n.getText().replace(/^\[\d+条\]\s*/g, "") //去除前面的 [number条]
    const msgs = `${this.formatTime("HH:mm")} ${n.getTitle()}: ${text}`
    return msgs
  }

  public formatMsgs(msgs: string[]): string {
    const base_msgs = `\n当前电量: ${device.getBattery()}%\n是否充电: ${device.isCharging()}`
    const findSomething = (list: string[], val: string) => _.some(list, (v) => _.includes(v, val))
    const del_head_line = _.head(msgs) === this.line.default || _.head(msgs) === "\n"
    const del_last_line = _.last(msgs) === "\n"
    const add_warn = findSomething(msgs, "无效") || findSomething(msgs, "失败")
    if (del_head_line) msgs.shift()
    if (del_last_line) msgs.pop()
    if (add_warn) msgs.unshift(this.line.warn)
    return [...msgs, base_msgs].join("\n")

    // message = message.replace(/^[\n-]+|[\n]+$/g, "") //如果开头有很多的-或者\n，则去掉  如果结尾有\n 去除
  }
}

export const ctrl = new Ctrl()
export const tools = new Tools()
