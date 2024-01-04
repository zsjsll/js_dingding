let dd = require("./dd.js")
let qq = require("./qq.js")
let tools = require("./tools.js")

module.exports = { setConfig, setlog, startDDPunkIn, startQQSendMsg }

/**
 * 合并设置，添加时间
 *
 * @param {Config} target
 * @param {Config} source
 */
function setConfig(target, source) {
    if (!(source.ACCOUNT && source.PASSWD && source.QQ)) {
        console.error("设置根目录下config.js中的ACCOUNT、PASSWD、QQ参数.如果不存在,请复制config/config.js到根目录下!")
        return false
    }
    let cfg = Object.assign(target, source)
    cfg["GLOBAL_LOG_FILE_DIR"] = cfg["GLOBAL_LOG_FILE_DIR"] + tools.getCurrentDate() + ".log"
    cfg["pause"] = false
    return cfg
}

/**
 *
 *
 * @param {Config} config
 */
function setlog(config) {
    auto()
    // 创建运行日志
    console.setGlobalLogConfig({ file: config.GLOBAL_LOG_FILE_PATH })
}

/**
 *
 *
 * @param {Config} config
 * @param {number} delay
 *
 */
function startDDPunkIn(config, delay) {
    console.log("本地时间: " + tools.getCurrentDate() + " " + tools.getCurrentTime())
    if (config.DEV) delay = -1
    tools.holdOn(delay)
    console.log("开始打卡")
    let isStartDD = dd.startDD(config.RETRY, config.PACKAGE_ID_LIST.DD, config.ACCOUNT, config.PASSWD)
    if (!isStartDD) {
        console.error("无法打开钉钉!")
        return false
    }
    dd.punchIn(config.RETRY, config.CORP_ID)
    return true
}

/**
 *
 *
 * @param {Config} config
 */
function startQQSendMsg(config, msg) {
    let isStartQQ = qq.startQQ(config.PACKAGE_ID_LIST.QQ)
    if (!isStartQQ) {
        console.error("无法打开QQ!")
        return false
    }
    qq.sendMsg(config.PACKAGE_ID_LIST.QQ, config.QQ, msg)
    return true
}
