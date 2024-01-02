module.exports = { initConfig, initAutojs }

/**
 * 合并设置，添加时间
 *
 * @param {Config} target
 * @param {Config} source
 */
function initConfig(target, source) {
    const cfg = Object.assign(target, source)
    cfg["GLOBAL_LOG_FILE_DIR"] = cfg["GLOBAL_LOG_FILE_DIR"] + require("./tools.js").getCurrentDate() + ".log"
    return cfg
}

function initAutojs() {
    auto()
    // 创建运行日志
    console.setGlobalLogConfig({ file: GLOBAL_LOG_FILE_PATH })
}
