import type { RspackOptions, Compiler, RspackPluginInstance } from "@rspack/core"
import path from "path/posix"
import axios from "axios"
import fs from "fs/promises"

// 自己编写的插件
class AutoxDeployPlugin implements RspackPluginInstance {
  private readonly cmd: string
  private readonly srcPath: string
  private readonly url: string
  // private readonly project: Project

  constructor(option: Option) {
    this.cmd = option.type
    const dirname = path.dirname(path.resolve(option.srcPath))
    this.srcPath = path.resolve(option.srcPath)

    if (this.cmd === "rerun") {
      this.srcPath = dirname
    } else {
      this.srcPath = dirname
    }

    this.url = `http://127.0.0.1:9317/exec`
  }

  private async sendUrl() {
    try {
      const req = await axios.get(this.url, {
        params: {
          cmd: this.cmd,
          path: this.srcPath,
        },
      })
      console.info(req.data)
    } catch (error) {
      console.error("自动部署失败,autox.js服务未启动")
      console.error("请启动auto.js服务")
      return error
    }
  }

  private async createProjectFile() {
    const dirName = "project.json"
    const projectPath = path.join(this.srcPath, dirName)

    const package_json = require("./package.json")
    const project = {
      name: package_json.name,
      main: package_json.main,
      ignore: ["build"],
      packageName: `com.autojs.${package_json.name}`,
      versionName: package_json.version,
      versionCode: Number(package_json.version.split(".")[0]),
    }
    const jsonString = JSON.stringify(project, null, 2)
    try {
      await fs.writeFile(projectPath, jsonString, { encoding: "utf8", flag: "w+" })
      console.info(`已写入${dirName}`)
    } catch (error) {
      console.error(`${dirName}已存在`)
      return error
    }
  }

  apply(compiler: Compiler) {
    // if (this.options === this.opt) return console.log("没有options，不进行任何操作！")
    compiler.hooks.done.tap("AutoxDeployPlugin", async () => {
      try {
        await this.createProjectFile()
        await this.sendUrl()
      } catch (error) {
        console.error(error)
      }
    })
  }
}

const entry_file = path.resolve("./src/main.ts")
const entry_file_name = path.basename(entry_file)
const alias_path = path.resolve("./src/modules")
const output_path = path.resolve("./dist")
const src_apth = path.join(output_path, entry_file_name)
console.log(src_apth)

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
      new AutoxDeployPlugin({
        type: isWatch ? "rerun" : "save",
        srcPath: src_apth,
      }),
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
  } else {
    console.log("开始打包")
  }

  return config
}
