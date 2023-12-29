const autojsUtils = require("./modules/autojs-utils")
const tools = require("./modules/tools.js")
const init = require("./modules/init.js")
const target = require("../config/config.js")
const source = require("../config.js")

// autojsUtils.test()

/** @type {Config} */
const CONFIG = init.initConfig(target, source)
console.log(CONFIG)

tools.isInWhiteList(true,,n)