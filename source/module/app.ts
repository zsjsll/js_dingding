import { backHome, openApp, getCurrentDate, getCurrentTime, holdOn } from "./tools"

export interface QQConfig {
    home_id: string
    package_id: string
    qq_num: string
}

interface App {
    open(num: number): boolean
}

export class QQ implements App {
    private home_id: string
    private package_id: string
    private qq_num: string

    constructor(home_id: string, qq_package_id: string, qq_num: string) {
        this.home_id = home_id
        this.package_id = qq_package_id
        this.qq_num = qq_num
    }

    open() {
        return openApp(this.package_id)
    }

    sendmsg(message: string) {
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + this.qq_num,
            packageName: this.package_id,
        })
        const input = id(this.package_id + ":id/input").findOne(-1)
        input.setText(`${message}\n当前电量:${device.getBattery()}%\n是否充电:${device.isCharging()}`)
        const send = text("发送").clickable().findOne(-1)
        send.click()
        console.info("发送成功")
        return true
    }
    openAndSendMsg(message: string) {
        console.log("发送信息")
        backHome(this.home_id)
        if (!this.open()) {
            console.error("无法打开QQ!")
            return false
        }
        const r = this.sendmsg(message)
        backHome(this.home_id)
        return r
    }
}

export interface DDConfig {
    home_id: string
    package_id: string
    account: string
    passwd: string
    corp_id: string
}

export class DD implements App {
    private home_id: string
    private package_id: string
    private account: string
    private passwd: string
    private corp_id: string
    constructor(home_id: string, package_id: string, account: string, passwd: string, corp_id?: string) {
        this.home_id = home_id
        this.package_id = package_id
        this.account = account
        this.passwd = passwd
        this.corp_id = corp_id
    }

    // 登录钉钉，如果已经登录，false
    private logining() {
        if (id(this.package_id + ":id/cb_privacy").findOne(1e3) !== null) {
            id("et_phone_input").findOne(-1).setText(this.account)
            id("et_password").findOne(-1).setText(this.passwd)
            id("cb_privacy").findOne(-1).click()
            id("btn_next").findOne(-1).click()
            return true
        } else return false
    }
    // 不进行更新
    private noUpdate() {
        let noupdate = text("暂不更新").findOne(10e3)
        if (noupdate !== null) {
            noupdate.click()
            return true
        } else return false
    }
    // 强制回到app的home界面
    private atAppHome() {
        const message = id("home_app_item").indexInParent(0).findOne(1e3)

        if (message === null) return false
        message.click()
        return true
    }

    open(try_of_num: number) {
        openApp(this.package_id)
        for (let index = 1; index <= try_of_num; index++) {
            console.info(`第${index}次登录...`)
            backHome(this.home_id)
            console.log("正在启动" + app.getAppName(this.package_id) + "...")

            if (!openApp(this.package_id)) {
                console.warn("启动失败，重新启动...")
                continue
            }
            if (!this.logining()) console.log("正在登录...")
            else console.log("可能已登录")
            if (this.noUpdate()) console.info("取消更新")
            else console.log("无更新消息")
            const is_at_app_home = this.atAppHome()
            sleep(5e3) //如果设置了极速打卡或者蓝牙自动打卡， 会在这段时间完成打卡
            if (is_at_app_home) return true
            else console.warn("登录失败,重试...")
        }
        console.error(`重试${try_of_num}次,登录失败!`)
        return false
    }

    punchIn(try_of_num: number) {
        const u = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"
        const url = this.corp_id === "" ? u : `${u}?corpId=${this.corp_id}`

        const a = app.intent({
            action: "VIEW",
            data: url,
            //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
        })
        for (let index = 1; index <= try_of_num; index++) {
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
            const btn =
                text("上班打卡").clickable(true).findOnce() ||
                text("下班打卡").clickable(true).findOnce() ||
                text("迟到打卡").clickable(true).findOnce()
            if (btn === null) {
                click(device.width / 2, device.height * 0.56)
                console.log("点击打卡按钮坐标")
            } else {
                btn.click()
                console.log("按下打卡按钮")
            }
            if (textContains("成功").findOne(15e3) === null) {
                // msg = `考勤打卡:${getCurrentTime()}打卡·无效\n也许未到打卡时间`
                console.warn("打卡无效,也许未到打卡时间!")
                return false
            }
            // msg = `考勤打卡:${getCurrentTime()}打卡·成功\n但未收到成功消息`
            console.info("打卡成功!")
            return true
        }
        console.error(`重试${try_of_num}次,打卡失败!`)
        return false
    }

    openAndPunchIn(try_of_num: number) {
        console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
        console.log("开始打卡")
        if (!this.open(try_of_num)) {
            console.error("无法打开钉钉!")
            return false
        }
        this.punchIn(try_of_num)
        return true
    }
}
