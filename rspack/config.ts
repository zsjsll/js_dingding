// import AutoxDeployPlugin from "./webpack/autox-deploy-webpack-plugin/index.js"

import type { RspackOptions } from "@rspack/core"
import path from "path/posix"

const entry_file = path.resolve("./src/main.ts")
const alias_path = path.resolve("./src/modules")
const output_path = path.resolve("./dist")

function createConfig(isWatch: boolean): RspackOptions {
  const config: RspackOptions = {
    devtool: false,

    entry: entry_file,

    devServer: {
      hot: true,
      watchFiles: ["src/**/*"],
      port: 3200,
    },

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

    ...(isWatch && {
      optimization: {
        minimize: false,
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

  return config
}

export default createConfig
