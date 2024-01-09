export function backHome(home_id: string) {
    if (currentPackage() === home_id) return
    // 先退回到桌面
    for (let i = 0; i < 5; i++) {
        back()
        sleep(200)
    }
    // 再点击home键
    home()
    sleep(1e3)
    return
}

export function openApp(package_id: string) {
    app.launchPackage(package_id)
    if (packageName(package_id).findOne(20e3) === null) return false
    else return true
}

function formatDateDigit(num: number) {
    return num < 10 ? "0" + num.toString() : num.toString()
}

export function getCurrentTime() {
    let currentDate = new Date()
    let hours = formatDateDigit(currentDate.getHours())
    let minute = formatDateDigit(currentDate.getMinutes())
    // let second = formatDateDigit(currentDate.getSeconds())
    let formattedTimeString = hours + ":" + minute
    return formattedTimeString
}

export function getCurrentDate() {
    let WEEK_DAY = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
    let currentDate = new Date()
    let year = formatDateDigit(currentDate.getFullYear())
    let month = formatDateDigit(currentDate.getMonth() + 1)
    let date = formatDateDigit(currentDate.getDate())
    let week = currentDate.getDay()
    let formattedDateString = year + "-" + month + "-" + date + "-" + WEEK_DAY[week]
    return formattedDateString
}

/**
 *
 *
 * @export
 * @param {number} delay 小于等于0的时候，没有延时
 */
export function holdOn(delay: number) {
    if (delay <= 0) {
        return
    } else {
        let randomTime = random(1e3, delay * 1e3 * 60)
        toastLog(Math.floor(randomTime / 1000) + "秒后启动程序" + "...")
        sleep(randomTime)
    }
}
