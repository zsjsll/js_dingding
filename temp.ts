import { includes, replace, some } from "lodash"

const PACKAGE_ID_LIST = {
    QQ: "com.tencent.tim", // 请使用tim
    DD: "com.alibaba.android.rimet", // 钉钉
    XMSF: "com.xiaomi.xmsf", // 小米推送服务
    CLOCK: "com.android.alarmclock", // 系统闹铃,自行修改
    HOME: "com.meizu.flyme.launcher", //桌面的包名称，自行修改
}

const a = some(PACKAGE_ID_LIST, (v) => "com.tencent.tim" === v)
const b = includes(PACKAGE_ID_LIST, "com.tencent.ti")
console.log(a)
console.log(b)
