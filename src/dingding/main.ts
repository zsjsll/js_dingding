const PACKAGESNAME = "com.alibaba.android.rimet"
const HOME = "com.miui.home"
const APPNAME = "钉钉"
const ACCOUNT = "19988329986"
const PASSWD = "1313243"
const RETRY = 10
const CORP_ID = ""

function isLogin() {
  return !id(`${PACKAGESNAME}:id/cb_privacy`).findOne(5e3)
}
