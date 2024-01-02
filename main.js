const tools = require("./modules/tools.js")
const init = require("./modules/init.js")
const target = require("./config/config.js")
const source = {} || require("./config.js")

// autojsUtils.test()

/** @type {Config} */
const CONFIG = init.initConfig(target, source)
console.log(CONFIG)

id("et_phone").untilFind().setText("19988329986")
id("btn_next").untilFind().click()
id("design_bottom_sheet").untilFind()
id("btn_next").untilFind().click()