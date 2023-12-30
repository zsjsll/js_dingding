module.exports = {
    isRoot: () => (shell("su -v").code === 0 ? true : false),

    /**
     *通知白名单
     *
     * @param {Filter_switch } filter_switch
     * @param {White_list} white_list 白名单
     * @param {org.autojs.autojs.core.notification.Notification} find_package 截取的信息，和白名单进行对比
     * @return {boolean}
     */

    isInWhiteList: (filter_switch, white_list, find_package) => {
        let check = Object.values(white_list).some((item) => find_package.getPackageName() == item)
        if (!filter_switch || check) {
            console.verbose(find_package.getPackageName())
            console.verbose(find_package.tickerText)
            console.verbose(find_package.getText())
            console.verbose("---------------------------")
            return true
        } else {
            return false
        }
    },

    /**
     *设置音量
     *
     * @param {number} volume
     */
    // TODO:
    setVolume: (volume) => {
        device.setMusicVolume(volume)
        device.setNotificationVolume(volume)
        device.setAlarmVolume(volume)
    },

    /**
     *是否找到一些东西
     *
     * @param {*} something
     * @return {*}
     */
    isFind: (something) => {
        return something !== null ? true : false
    },
    /**
     *返回再退出到桌面,共需要时间4s
     *
     * @param {number} [t=2e3]
     */
    backHome: (home_id) => {
        if (currentPackage() === home_id) {
            return
        } else {
            // 先退回到桌面
            sleep(1e3)
            for (let i = 0; i < 9; i++) {
                back()
                sleep(200)
            }
            // 再点击home键
            sleep(2e3)
            home()
            sleep(2e3)
        }
    },
    test: (t) => {
        let k = t || 2e3
        log(k)
    },
}
