const backHome = require("./tools").backHome
const startAPP = require("./tools.js").startAPP

module.exports = { sendQQMsg }

/**
 *
 *
 * @param {Package_id} qq_package_id

 */
function openQQ(qq_package_id) {
    backHome()
    return startAPP(qq_package_id)
}

const sendQQMsg = (qq_package_id, qq, message) => {
    const isOpenQQ = openQQ(qq_package_id)
    if (!isOpenQQ) {
        console.error("无法打开QQ！")
        return false
    }

    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + qq,
        packageName: qq_package_id,
    })
    const input = id("input").untilFindOne()
    input.setText(`${message}\n当前电量:${device.getBattery()}%\n是否充电:${device.isCharging()}`)
    const send = text("发送").clickable().untilFindOne()
    send.click()
    console.info("发送成功")
    backHome()
    return true
}
