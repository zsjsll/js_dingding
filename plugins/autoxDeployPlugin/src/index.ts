// import { get } from "http"
import { posix } from "path"
import axios from "axios"
import fs from "fs/promises"

interface Package_json {
  name: string
  main: string
  version: string
  dist: { dir: string }
  author: string
}

interface Option {
  hook?: string
  params: string
  package_json: Package_json
}

interface Project {
  name: string
  main: string
  ignore: [string]
  packageName: string
  versionName: string
  versionCode: number
}

class AutoxDeployPlugin {
  private readonly cmd: string
  private readonly dir: string
  private readonly hook: string
  private readonly url: string
  private readonly project: Project

  constructor(option: Option) {
    this.cmd = option.params
    this.dir = posix.resolve(option.package_json.dist.dir)
    if (option.hook) this.hook = option.hook
    else this.hook = "writeBundle"

    this.url = "http://127.0.0.1:9317/exec"
    this.project = {
      name: option.package_json.name,
      main: option.package_json.main,
      ignore: ["build"],
      packageName: `com.autojs.${option.package_json.name}`,
      versionName: option.package_json.version,
      versionCode: Number(option.package_json.version.split(".")[0]),
    }
  }

  private async sendUrl() {
    try {
      const req = await axios.get(this.url, {
        params: {
          cmd: this.cmd,
          path: this.dir,
        },
      })
      console.log(req.data)
    } catch (error) {
      console.error("自动部署失败,autox.js服务未启动")
      console.error("请启动auto.js服务")
    }
  }

  private async createProjectFile() {
    const dirName = "project.json"
    const path = posix.join(this.dir, dirName)
    const jsonString = JSON.stringify(this.project, null, 2)
    try {
      await fs.writeFile(path, jsonString, { encoding: "utf8", flag: "w+" })
    } catch (error) {
      console.log(`${dirName}已存在`)
    }
  }

  public getPlugin() {
    return {
      name: "AutoxDeploy",
      [this.hook]: async () => {
        await this.createProjectFile()
        this.sendUrl()
      },
    }
  }
}

export default function autoxDeployPlugin(options: Option) {
  const instance = new AutoxDeployPlugin(options)
  return instance.getPlugin()
}
