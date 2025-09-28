import * as esbuild from "esbuild"
import { es5Plugin } from "esbuild-plugin-es5"

import { performance } from "perf_hooks"

const isWatchMode = process.argv.includes("-w") || process.argv.includes("--watch")
const outDir = "dist"
const entryPoints = ["./src/main.ts"]

function TimingPlugin(): esbuild.Plugin {
  return {
    name: "timing-and-alias-reporter",

    setup(build) {
      // 在 setup 作用域内声明一个变量来存储开始时间
      let startTime = 0
      // 钩子 1: 构建开始时触发
      build.onStart(() => {
        startTime = performance.now()
        // 注意：onStart 不需要返回任何东西
      })
      // 钩子 2: 构建结束时触发
      build.onEnd((result) => {
        // 在这里安全地计算耗时
        const duration = (performance.now() - startTime).toFixed(2)

        if (result.errors.length > 0) {
          console.error(`\n❌ 构建失败 (${duration}ms): ${result.errors.length} 个错误`)
        } else {
          console.log(`\n✅ 构建成功 (${duration}ms) - ${new Date().toLocaleTimeString()}`)
        }
      })
    },
  }
}

const baseOptions: esbuild.BuildOptions = {
  entryPoints: entryPoints,
  bundle: true,
  outdir: outDir,
  format: "iife", // 输出 ES Module 格式
  sourcemap: false, // 生成 Source Map
  target: ["es5"], // 目标环境
  platform: "browser",
  logLevel: "info",

  plugins: [
    TimingPlugin(),
    es5Plugin({
      swc: {
        // SWC 的编译配置
        jsc: {
          parser: {
            syntax: "typescript",
            decorators: true, // 启用装饰器解析
          },
          transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
          },
          target: "es3",
        },
      },
    }),
  ],
}

async function runEsbuild() {
  if (isWatchMode) {
    const watchOptions: esbuild.BuildOptions = {}
    const ctx = await esbuild.context({ ...baseOptions, ...watchOptions })
    console.log(`[WATCH MODE] 正在启动文件监听...`)
    await ctx.watch()

    console.log("\n======================================")
    console.log("         👁️ 文件监听已启动...")
    console.log("         🚫 按 Ctrl+C 停止。")
    console.log("======================================")

    // 监听 Ctrl+C (SIGINT) 信号，以便优雅地调用 dispose()
    process.on("SIGINT", async () => {
      console.log("\n👋 停止监听。清理 Esbuild 资源...")
      await ctx.dispose()
      process.exit(0)
    })
  } else {
    const runhOnceOptions: esbuild.BuildOptions = {
      // minify: true, // 压缩代码
      // minifyIdentifiers: true,
      // minifySyntax: true,
      // legalComments: "none",
    }
    const ctx = await esbuild.context({ ...baseOptions, ...runhOnceOptions })
    try {
      console.log(`🛠️ [BUILD MODE] 执行单次构建...`)
      await ctx.rebuild()

      console.log(`📂 输出目录 ${outDir}`)
    } catch (e) {
      console.error("❌ 构建出错:", e)
    } finally {
      await ctx.dispose()
    }
    process.exit(0)
  }
}

runEsbuild()
