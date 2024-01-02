const tools = require("./modules/tools.js")
const init = require("./modules/init.js")
const target = require("./config/config.js")
const DD = require("./modules/dd.js")

if (!files.exists("./config.js")) files.copy("./config/config.js", "./config.js")
const source = require("./config.js")

// autojsUtils.test()

/** @type {Config} */
const CONFIG = init.initConfig(target, source)
console.log(CONFIG)

// DD.openDD(CONFIG.PACKAGE_ID_LIST.DD, CONFIG.ACCOUNT, CONFIG.PASSWD, 5)
