// import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.js"
// import { SwcJsMinimizerRspackPlugin } from "@rspack/core"
import type { RspackOptions, Compiler, RspackPluginInstance } from "@rspack/core"
import path from "path/posix"
import { get } from "http"

// 自己编写的插件

class AutoxDeployPlugin implements RspackPluginInstance {
  opt = { type: undefined, path: undefined }

  constructor(options = this.opt) {
    this.options = options
  }

  sendCmd(cmd, path) {
    console.error("执行命令：", cmd)
    path = encodeURI(path)
    const req = get("http://127.0.0.1:9317/exec?cmd=" + cmd + "&path=" + path, (res) => {
      res.setEncoding("utf8")
      res
        .on("data", (data) => {
          console.error(data)
        })
        .on("error", () => {
          console.error("返回数据错误")
        })
    })
    req.on("error", () => {
      console.error("watch模式，自动" + cmd + "失败,autox.js服务未启动")
      console.error("请使用 ctrl+shift+p 快捷键，启动auto.js服务")
    })
  }

  apply(compiler: Compiler) {
    if (this.options === this.opt) return console.log("没有options，不进行任何操作！")
    compiler.hooks.done.tap("AutoxDeployPlugin", () => {
      if (typeof this.options.path !== "string") {
        throw new Error("必须提供一个有效的相对路径")
      }
      const out = posix.resolve(this.options.path)
      console.log("----->[out_file_path] =", out)

      switch (this.options.type) {
        case "rerun":
          this.sendCmd("rerun", out)
          break
        case "save":
          this.sendCmd("save", out)
          break
        default:
          console.error("重新编译后,不进行任何操作")
          break
      }
    })
  }
}

const entry_file = path.resolve("./src/main.ts")
const alias_path = path.resolve("./src/modules")
const output_path = path.resolve("./dist")

export default (env: { RSPACK_WATCH: boolean }) => {
  const isWatch = env.RSPACK_WATCH
  console.log(env)

  const config: RspackOptions = {
    devtool: false,

    entry: entry_file,

    devServer: {
      hot: true,
      watchFiles: ["src/**/*"],
      port: 3200,
    },
    watch: true,
    // watchOptions: {
    //   ignored: ["**/*.js", "**/*.json", "**/node_modules", "**/webpack", "**/.git"],
    //   // aggregateTimeout: 1000,
    //   poll: true,
    // },

    mode: "production",
    target: ["web", "es3"],
    output: {
      path: output_path,
    },

    plugins: [
      // new AutoxDeployPlugin({
      //   type: "save",
      //   path: output_path,
      // }),
    ],

    module: {
      rules: [
        {
          test: /\.ts$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: {
                    syntax: "typescript",
                    decorators: true,
                  },
                  transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                  },
                },
              },
            },
          ],
        },
      ],
    },

    resolve: {
      // tsConfig: "./tsconfig.json",
      extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
      alias: {
        "@": alias_path,
      },
    },

    optimization: {
      minimize: isWatch ? false : true,
    },
  }

  if (isWatch) {
    console.log("开启监听模式")

    // config.watchOptions = {
    //   ignored: ["**/*.js", "**/*.json", "**/node_modules", "**/webpack"],
    // }

    // config.optimization.minimize = false
  } else {
    console.log("开始打包")

    // config.optimization.minimize = true
  }

  return config
}
