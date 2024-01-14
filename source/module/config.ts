import { QQCfg, DDCfg } from "@/app"
import { PhoneCfg } from "@/phone"
import { ListenerCfg } from "@/listener"
import { BASE_CONFIG } from "@/init"

export type Cfg = {
    [k: string]: unknown
    PACKAGE_ID_LIST: White_list
    DELAY: number
    GLOBAL_LOG_FILE_DIR: string
    pause: boolean
} & QQCfg &
    DDCfg &
    PhoneCfg &
    ListenerCfg &
    BASE_CONFIG

type White_list = { XMSF: string; CLOCK: string }

export const config: Cfg = {
    ACCOUNT: "19988329986",
    PASSWD: "1313243",
    QQ: "124119885",
    CORP_ID: "", // 公司的钉钉CorpId, 如果只加入了一家公司, 可以不填

    /* 解锁屏幕参数 */
    UNLOCKSCREEN: {
        T: 720, // 滑动时间：毫秒
        Y1: 0.7, // 滑动起点 y 坐标：距离屏幕底部 10% 的位置, 华为系统需要往上一些 0.9
        Y2: 0.3, // 滑动终点 y 坐标：距离屏幕顶部 10% 的位置 0.1
    },

    SCREEN_BRIGHTNESS: 0, //运行时屏幕亮度
    VOLUME: 0, //声音大小
    OBSERVE_VOLUME_KEY: true, // 监听音量+-键, 开启后无法通过音量+-键调整音量, 按下音量+-键：结束所有子线程
    NOTIFICATIONS_FILTER: true, // 是否过滤通知
    DELAY: 4, //随机等待时间，单位：分钟,如果填写的值<:0，则跳过等待时间，目前手机设置的是5min锁屏，所以设定4min
    RETRY: 5, //登录和打卡的重试次数
    PACKAGE_ID_LIST: {
        QQ: "com.tencent.tim", // 请使用tim
        DD: "com.alibaba.android.rimet", // 钉钉
        XMSF: "com.xiaomi.xmsf", // 小米推送服务
        CLOCK: "com.android.alarmclock", // 系统闹铃,自行修改
        HOME: "com.meizu.flyme.launcher", //桌面的包名称，自行修改
    },

    GLOBAL_LOG_FILE_DIR: "/sdcard/脚本/Archive/", // 运行日志路径
    DEV: true,
    pause: false,
}
