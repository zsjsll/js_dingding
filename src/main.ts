import { tools } from "@/tools"
import Listener from "@/listener"
import Config from "@/config"
import Phone from "@/phone"
import { QQ, DD, Clock } from "@/app"
import _ from "lodash-es"

;(function main() {
  //初始化脚本
  tools.onlyRunOneScript() //停止其他脚本，只运行当前脚本
  setScreenMetrics(device.width, device.height)
  auto()
  console.log("完成初始化脚本")

  //初始化设置
  const config = new Config()
  const cfg = config.initCfg()
  config.createLog()
  config.information(cfg)
  console.log("完成初始化设置")

  const phone = new Phone(cfg)
  const listener = new Listener(cfg)
  const qq = new QQ(cfg)
  const dd = new DD(cfg)
  const clock = new Clock(cfg)

  Listener.debug = () => {
    console.log()
  }

  listener.listenVolumeKey() //可以添加自己需要的调试函数

  listener.listenNotification((notification) => {
    listenMsg(notification)
    listenClock(notification)
    listenDD(notification)
  })
  toastLog("运行中。。。")

  //重写发送函数
  const isSendAllMsg = (final_msg: string[]) => {
    qq.openAndSendMsg(final_msg)
    cfg.info = []
    return _.isEmpty(cfg.info)
  }

  function listenMsg(n: org.autojs.autojs.core.notification.Notification) {
    const doIt = (f: () => string[]) => {
      threads.shutDownAll()
      cfg.thread = threads.start(() => {
        phone.turnOn()
        const msg = [...f(), ...cfg.info]
        if (!isSendAllMsg(msg)) return
        phone.turnOff()
      })
    }
    if (n.getText() === "邮件提醒: 你有一封新邮件") cfg.thread = threads.start(() => phone.turnOn())

    if (n.getText() === "帮助") {
      const default_msg = ["帮助: 显示所有指令内容", "打卡: 马上打卡", "锁屏: 停止当前动作后锁屏", "{n}暂停{m}: 延迟{n}次,暂停{m}次", "恢复: 恢复自动打卡"]
      doIt(() => [...default_msg, ...tools.pauseStatus(cfg.pause)])
      return
    }

    if (n.getText() === "打卡") {
      doIt(() => [...dd.openAndPunchIn(), ...tools.pauseStatus(cfg.pause)])
      return
    }

    if (_.includes(n.getText(), "暂停")) {
      cfg.pause = tools.formatPauseInput(n.getText())
      const pause_tatus_msg = _.isEmpty(tools.pauseStatus(cfg.pause)) ? ["暂停0次, 恢复定时打卡"] : tools.pauseStatus(cfg.pause)
      doIt(() => [...pause_tatus_msg])
      return
    }

    if (n.getText() === "恢复") {
      cfg.pause = [0, 0]
      doIt(() => ["恢复定时打卡成功"])
      return
    }

    if (n.getText() === "锁屏") {
      doIt(() => ["已停止当前动作", ...tools.pauseStatus(cfg.pause)])
      return
    }

    if (n.getText() === "测试") {
      console.info("测试")
    }
  }

  function listenClock(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGES.CLOCK.PACKAGENAME) return
    threads.shutDownAll()
    clock.closeAlarm()
    let msg: string[]
    const daka = cfg.pause[0] > 0 || cfg.pause[1] === 0 //执行打卡操作，或者直接输出现在状态
    cfg.pause = tools.changePause(cfg.pause) //修改pause参数
    const pause_tatus_msg = _.isEmpty(tools.pauseStatus(cfg.pause)) ? ["! 暂停打卡结束 !"] : tools.pauseStatus(cfg.pause)

    cfg.thread = threads.start(() => {
      phone.turnOn()
      if (daka) {
        tools.delay(cfg.DELAY) //随机延迟打卡
        msg = dd.openAndPunchIn()
      } else msg = pause_tatus_msg
      if (!isSendAllMsg(msg)) return
      phone.turnOff()
    })
  }

  function listenDD(n: org.autojs.autojs.core.notification.Notification) {
    if (n.getPackageName() !== cfg.PACKAGES.DD.PACKAGENAME) return
    // if (includes(n.getText(), "考勤打卡") && (includes(n.getText(), "成功") || includes(n.getText(), "全部正常"))) return

    cfg.info.push(tools.formatNotification(n))

    if (cfg.thread?.isAlive()) {
      console.log("alive")
      const old_thread = cfg.thread
      if (_.isEmpty(cfg.info)) return
      cfg.thread = threads.start(() => {
        old_thread?.join(0)
        phone.turnOn()
        if (_.isEmpty(cfg.info)) return
        if (!isSendAllMsg(cfg.info)) return
        phone.turnOff()
      })
    } else
      cfg.thread = threads.start(() => {
        phone.turnOn()
        if (!isSendAllMsg(cfg.info)) return
        phone.turnOff()
      })
  }
})()
