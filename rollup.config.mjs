import typescript from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import terser from "@rollup/plugin-terser"
import package_json from "./package.json" with { type: "json" }
import autoxDeployPlugin from "autoxdeployplugin"

const outputPath = package_json.dist.dir

export default {
  input: "src/main.ts",
  output: {
    dir: outputPath,
    format: "es",
    entryFileNames: "[name].mjs",
  },

  plugins: [
    typescript({
      outDir: outputPath,
    }),
    resolve(),
    commonjs(),
    json(),
    terser(),
    autoxDeployPlugin({ params: "save", package_json: package_json }),
  ],
}
