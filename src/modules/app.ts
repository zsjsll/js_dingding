import { tools, auto, _ } from "@/tools"
import { QQCfg, DDCfg, ClockCfg, SwipeScreen } from "@/types"

export class QQ {
  private readonly PACKAGESNAME: { QQ: string; HOME: string }
  private readonly APPNAME: string
  private readonly QQ: string
  private readonly RETRY: number

  constructor(cfg: QQCfg) {
    this.PACKAGESNAME = { QQ: cfg.PACKAGES.QQ.PACKAGENAME, HOME: cfg.PACKAGES.HOME.PACKAGENAME }
    this.QQ = cfg.QQ
    this.RETRY = cfg.RETRY
    this.APPNAME = cfg.PACKAGES.QQ.APPNAME as string
  }

  // 不进行更新
  private cancelUpdate() {
    // const window = id("6kp").findOne(3e3) //这个就是那个取消按键的id
    const window = text("发现新版本").findOne(2e3)
    if (window !== null) {
      const closeButton = window.parent().parent().child(1)
      auto.clickBounds(closeButton.bounds())
      console.info("取消更新弹窗")
    }
    const banner = text("点击更新").findOne(2e3)
    if (banner !== null) {
      const closeButton = banner.parent().child(3)
      auto.clickBounds(closeButton.bounds())
      console.info("取消更新横幅")
    }
    if (window === null && banner === null) console.log("无更新信息")
  }

  private open(): boolean {
    if (auto.openApp(this.PACKAGESNAME.QQ, this.APPNAME)) {
      sleep(2e3)
      this.cancelUpdate()
      return true
    }

    console.error("无法打开QQ!")
    return false
  }
  private chat(): boolean {
    // 最新的tim和qq 如果用意图启动，会出错误，所以改成查找控件来进入聊天窗口
    const nav = id("j_k").findOne(2e3)
    if (nav !== null) {
      // 这个组件是不可以点击的，只能点击他的父组件
      console.log("点击消息组件")
      const b = nav.parent()
      auto.clickBounds(b.bounds())
    } else {
      console.warn("点击消息绝对坐标！")
      bounds(0, 2194, 270, device.height)
      const x = 270 / 2
      const y = device.height - 10
      auto.clickBounds([x, y])
    }

    sleep(1e3)
    // const contact = id("aua").descStartsWith("123_").findOne(2e3)
    const contact = id("to2").indexInParent(1).findOne(2e3)
    if (contact !== null) {
      console.log("点击联系人")
      const b = contact
      auto.clickBounds(b.bounds())
    } else {
      console.warn("点击联系人绝对坐标！")
      // bounds(0, 372, device.width, 566)
      const x = device.width / 2
      const y = 566 - 10
      auto.clickBounds([x, y])
    }
    sleep(1e3)

    app.startActivity({
      action: "android.intent.action.VIEW",
      data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + this.QQ,
      packageName: this.PACKAGESNAME.QQ,
    })

    const t = text("发送").clickable().findOne(10e3)
    return t !== null
  }

  private sendmsg(message: string) {
    const input = id(this.PACKAGESNAME.QQ + ":id/input").findOne(10e3)

    input.setText(message)

    const send = text("发送").clickable().findOne(10e3)
    sleep(1000)
    auto.clickBounds(send.bounds())
    console.info("发送成功")
  }
  openAndSendMsg(message: string[]) {
    if (!_.isEmpty(message)) {
      for (let i = 1; i <= this.RETRY; i++) {
        console.info(`第${i}次运行QQ...`)
        auto.backHome(this.PACKAGESNAME.HOME)
        if (!this.open()) continue
        sleep(1e3)
        if (!this.chat()) continue
        sleep(1e3)
        console.log("发送信息")
        const msgs = tools.formatMsgs(message)
        console.info(msgs)
        this.sendmsg(msgs)
        break
      }
    } else console.log("消息为空，直接退出！")

    sleep(2e3)
    auto.backHome(this.PACKAGESNAME.HOME)
  }
}

export class DD {
  private readonly PACKAGESNAME: { DD: string; HOME: string }
  private readonly APPNAME: string
  private readonly ACCOUNT: string
  private readonly PASSWD: string
  private readonly RETRY: number
  private readonly CORP_ID: string

  constructor(cfg: DDCfg) {
    this.PACKAGESNAME = { DD: cfg.PACKAGES.DD.PACKAGENAME, HOME: cfg.PACKAGES.HOME.PACKAGENAME }
    this.APPNAME = cfg.PACKAGES.DD.APPNAME as string
    this.ACCOUNT = cfg.ACCOUNT
    this.PASSWD = cfg.PASSWD
    this.RETRY = cfg.RETRY
    this.CORP_ID = cfg.CORP_ID
  }
  private isLogin() {
    return !id(this.PACKAGESNAME.DD + ":id/cb_privacy").findOne(5e3)
  }
  // 登录钉钉，如果已经登录，false
  private logining() {
    //是否为新版本的钉钉，如果是，用旧的登录方式
    if (id("tv_more").findOne(2e3) !== null) {
      const a = id("tv_more").findOne(10e3)
      auto.clickBounds(a.bounds())
      sleep(2e3)
      const b = id("ll_rollback_old_login").findOne(10e3)
      auto.clickBounds(b.bounds())
      console.log("切换登录方式为旧版...")
    }
    sleep(2e3)
    id("et_phone_input").findOne(10e3).setText(this.ACCOUNT)
    sleep(2e3)
    id("et_password").findOne(10e3).setText(this.PASSWD)
    sleep(2e3)
    const c = id("cb_privacy").findOne(10e3)
    auto.clickBounds(c.bounds())
    sleep(2e3)
    const d = id("btn_next").findOne(10e3)
    auto.clickBounds(d.bounds())
  }

  // 不进行更新
  private cancelUpdate() {
    const window = text("暂不更新").findOne(10e3)
    if (window !== null) {
      auto.clickBounds(window.bounds())
      console.info("取消更新")
    } else console.log("无更新消息")
  }
  // 强制回到app的home界面
  private atAppHome() {
    if (!this.isLogin()) return false
    const message = id("home_app_item").indexInParent(0).findOne(5e3)
    if (message !== null) auto.clickBounds(message.bounds())
    else if (packageName(this.PACKAGESNAME.DD).findOne(2e3) !== null) {
      const x = device.width / 10
      const y = device.height * 0.95
      auto.clickBounds([x, y])
    } else return false
    return true
  }

  private open() {
    for (let index = 1; index <= this.RETRY; index++) {
      console.info(`第${index}次登录...`)
      auto.backHome(this.PACKAGESNAME.HOME)
      console.log("正在启动" + app.getAppName(this.PACKAGESNAME.DD) + "...")

      if (!auto.openApp(this.PACKAGESNAME.DD, this.APPNAME)) {
        console.warn("启动失败，重新启动...")
        continue
      }

      if (!this.isLogin()) {
        console.log("正在登录...")
        this.logining()
      } else console.log("可能已登录")
      this.cancelUpdate()
      sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
      if (this.atAppHome()) return true
      else console.warn("登录失败,重试...")
    }
    console.error(`重试${this.RETRY}次,登录失败!`)
    return false
  }

  private punchIn(): string[] {
    const u = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
    const url = this.CORP_ID === "" ? u : `${u}?corpId=${this.CORP_ID}`

    const a = app.intent({
      action: "VIEW",
      data: url,
      //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
    })
    for (let index = 1; index <= this.RETRY; index++) {
      console.info(`第${index}次尝试打卡...`)
      app.startActivity(a)
      console.log("正在进入考勤界面...")
      if (text("申请").findOne(15e3) === null) {
        console.error("连接错误,重新进入考勤界面!")
        back()
        continue
      }
      console.log("已进入考勤界面")
      console.log("等待连接到考勤机...")
      if (textContains("考勤").findOne(15e3) === null) {
        console.error("不符合打卡规则,重新进入考勤界面!")
        back()
        continue
      }
      console.info("可以打卡")
      const btn = text("上班打卡").clickable(true).findOnce() || text("下班打卡").clickable(true).findOnce() || text("迟到打卡").clickable(true).findOnce()
      if (btn !== null) {
        auto.clickBounds(btn.bounds())
        console.log("按下打卡按钮")
      } else {
        const x = device.width / 2
        const y = device.height * 0.6
        auto.clickBounds([x, y])
        console.log("点击打卡按钮坐标")
      }
      if (textContains("成功").findOne(15e3) === null) {
        console.warn("打卡无效,也许未到打卡时间!")
        return [`考勤打卡:${tools.formatTime("HH:mm")} 打卡·无效`]
      }
      // return `考勤打卡:${formatTime("HH:mm")}打卡·成功\n但未收到成功消息`
      return [`考勤打卡:${tools.formatTime("HH:mm")} 打卡·成功`]
    }
    const e = [`重试${this.RETRY}次, 打卡失败!`]
    console.error(e)
    return e
  }

  openAndPunchIn(): string[] {
    console.log("本地时间: " + tools.formatTime("YYYY-MM-DD HH:mm:ss"))
    console.log("开始打卡")
    auto.backHome(this.PACKAGESNAME.HOME)
    if (!this.open()) {
      const e = ["无法打开钉钉!"]
      console.error(e)
      return e
    }
    const r = this.punchIn()
    sleep(3e3)
    auto.backHome(this.PACKAGESNAME.HOME)
    return r
  }
}

export class Clock {
  private readonly PACKAGESNAME: { CLOCK: string; HOME: string }
  private readonly SWIPESCREEN: SwipeScreen
  private readonly RETRY: number

  constructor(cfg: ClockCfg) {
    this.PACKAGESNAME = { CLOCK: cfg.PACKAGES.CLOCK.PACKAGENAME, HOME: cfg.PACKAGES.HOME.PACKAGENAME }
    this.SWIPESCREEN = cfg.SWIPESCREEN
    this.RETRY = cfg.RETRY
  }

  //需要root
  closeAlarm() {
    sleep(2e3)
    for (let i = 1; i <= this.RETRY; i++) {
      console.log(`第${i}次关闭闹钟...`)
      VolumeDown()
      sleep(1e3)
      if (!packageName(this.PACKAGESNAME.CLOCK).findOne(500)) {
        console.log("已闭闹钟")
        return true
      } else {
        auto.swipeScreen(this.SWIPESCREEN)
      }
    }
    console.warn(`重试${this.RETRY}次, 可能未关闭!`)
    return false
  }
}
