import { rollup } from "rollup"
import { loadConfigFile } from "rollup/loadConfigFile"
import autoxDeployPlugin from "autoxdeployplugin"
import config from "../package.json" with { type: "json" }

async function rollupBuild(cb) {
  const { options, warnings } = await loadConfigFile("./rollup.config.mjs", {})
  warnings.flush()
  for await (const option of options) {
    const bundle = await rollup(option)
    await Promise.all(option.output.map(bundle.write))
    console.log(option.output)

    autoxDeployPlugin({ params: "save", package_json: config })
  }
}

rollupBuild()
