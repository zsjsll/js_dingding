import createConfig from "./config"
import { rspack } from "@rspack/core"

const isWatch = process.argv.includes("-w") || process.argv.includes("--watch") ? true : false

const config = createConfig(isWatch)

const compiler = rspack(config)

if (isWatch) {
  compiler.watch({ poll: 1000 }, (err, stats) => {
    if (err) {
      console.error("❌ 构建异常:", err)
      return
    }

    if (!stats) {
      console.error("❌ 构建失败: stats 未生成")
      return
    }

    if (stats.hasErrors()) {
      console.error(
        "❌ 构建错误:\n",
        stats
          .toJson()
          .errors?.map((e) => e.message)
          .join("\n")
      )
      return
    }
    console.log("✅ 构建成功:\n", stats.toString({ colors: true }))
  })
} else {
  compiler.run((err, stats) => {
    if (err) {
      console.error("❌ 构建异常:", err)
      return
    }
    if (!stats) {
      console.error("❌ 构建失败: stats 未生成")
      return
    }
    if (stats.hasErrors()) {
      console.error(
        "❌ 构建错误:",
        stats
          .toJson()
          .errors?.map((e) => e.message)
          .join("\n")
      )
      return
    }
    console.log("✅ 构建成功:\n", stats.toString({ colors: true }))
  })
}
