// import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.js"
// import { SwcJsMinimizerRspackPlugin } from "@rspack/core"
import type { RspackOptions } from "@rspack/core"
import path from "path/posix"

// const entry_path = "./src"
// const entry_file = path.resolve(path.join(entry_path, "main.ts"))
const entry_file = path.resolve("./src/main.ts")
const alias_path = path.resolve("./src/modules")
const output_path = path.resolve("./dist")

export default (env: { RSPACK_WATCH: boolean }) => {
  const isWatch = env.RSPACK_WATCH

  const config: RspackOptions = {
    devtool: false,

    entry: entry_file,
    watch: isWatch,
    ...(isWatch && {
      watchOptions: {
        ignored: ["**/*.js", "**/*.json", "**/node_modules", "**/webpack"],
        // aggregateTimeout: 1000,
        poll: 1000,
      },
    }),

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
      modules: ["node_modules"],
      alias: {
        "@": alias_path,
      },
    },

    ...(!isWatch && {
      optimization: {
        minimize: true,
      },
    }),
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
  console.log(config.watchOptions)

  return config
}
