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


// TODO