const http = require("http")
const path = require("path")

/**
 * @param {string} cmd
 * @param {string} path
 */
function sendCmd(cmd, path) {
    console.error("执行命令：", cmd)
    path = encodeURI(path)
    const req = http.get("http://127.0.0.1:9317/exec?cmd=" + cmd + "&path=" + path, (res) => {
        res.setEncoding("utf8")
        res.on("data", (data) => {
            console.error(data)
        }).on("error", () => {
            console.error("返回数据错误")
        })
    })
    req.on("error", function (err) {
        console.error("watch模式，自动" + cmd + "失败,autox.js服务未启动")
        console.error("请使用 ctrl+shift+p 快捷键，启动auto.js服务")
    })
}
const args = process.argv[2]
const p = path.posix.resolve("dist")
console.log(p)

if (args === "save") sendCmd(args, path.posix.resolve("dist"))
if (args === "rerun") sendCmd(args, path.posix.resolve("dist/main.js"))
