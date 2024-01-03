const dd = require("./dd.js")
const qq = require("./qq.js")
const tools = require("./tools.js")

module.exports = { setConfig, setAutojs }

/**
 * 合并设置，添加时间
 *
 * @param {Config} target
 * @param {Config} source
 */
function setConfig(target, source) {
    if (source.ACCOUNT && source.QQ && source.PASSWD === "") {
        console.error("设置根目录下config.js中的ACCOUNT、PASSWD、QQ参数，如果不存在,请复制config/config.js到根目录下!")
        return false
    }
    const cfg = Object.assign(target, source)
    cfg["GLOBAL_LOG_FILE_DIR"] = cfg["GLOBAL_LOG_FILE_DIR"] + tools.getCurrentDate() + ".log"
    cfg["message"] = ""
    cfg["pause"] = false
    return cfg
}

function setAutojs() {
    auto()
    // 创建运行日志
    console.setGlobalLogConfig({ file: GLOBAL_LOG_FILE_PATH })
}

console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
holdOn(d)
console.log("开始打卡")
let statu_scode = {}
statu_scode = openDD(ACCOUNT, PASSWD)
if (!statu_scode["status"]) {
    sendQQMsg(statu_scode["text"])
    return
}
statu_scode = attendKaoQin(CORP_ID)
backHome()
sleep(1000)
sendQQMsg(statu_scode["text"])

return

/**
 *
 *
 * @param {Config} config
 */
function setDD(config) {
    console.log("本地时间: " + getCurrentDate() + " " + getCurrentTime())
    if (!config.DEV) {
        tools.holdOn(config.DELAY)
    }
    console.log("开始打卡")
    const isOpenDD = dd.openDD(config.RETRY, config.PACKAGE_ID_LIST.DD, config.ACCOUNT, config.PASSWD)
    if (!isOpenDD) {
        console.error("无法打开钉钉!")
        return false
    }
    dd.punchIn(config.RETRY, config.PACKAGE_ID_LIST.DD, config.ACCOUNT, config.PASSWD, config.CORP_ID)
    return true
}

/**
 *
 *
 * @param {Config} config
 */
function setQQ(config) {
    const isOpenQQ = qq.openQQ(config.PACKAGE_ID_LIST.QQ)
    if (!isOpenQQ) {
        console.error("无法打开QQ!")
        return false
    }
    qq.sendQQMsg(config.PACKAGE_ID_LIST.QQ, config.QQ, config.message)
    return true
}
