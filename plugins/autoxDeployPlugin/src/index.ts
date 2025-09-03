import { posix } from "path"
import axios from "axios"
import fs from "fs/promises"

interface PackageJson {
  name: string
  main: string
  version: string
  dist: { dir: string }
  author: string
}

interface Option {
  hook?: string
  params: string
  package_json: PackageJson
}

interface Project {
  name: string
  main: string
  ignore: [string]
  packageName: string
  versionName: string
  versionCode: number
}

function silent(consoleProps: string[]) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      const originalConsole = { ...console }
      consoleProps.forEach((v) => (console[v] = () => undefined))
      try {
        return originalMethod.apply(this, args)
      } finally {
        consoleProps.forEach((v) => {
          console[v] = originalConsole[v]
        })
      }
    }
  }
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
      console.info(req.data)
    } catch (error) {
      console.error("自动部署失败,autox.js服务未启动")
      console.error("请启动auto.js服务")
      return error
    }
  }

  private async createProjectFile() {
    const dirName = "project.json"
    const path = posix.join(this.dir, dirName)
    const jsonString = JSON.stringify(this.project, null, 2)
    try {
      await fs.writeFile(path, jsonString, { encoding: "utf8", flag: "w+" })
      console.info(`已写入${dirName}`)
    } catch (error) {
      console.error(`${dirName}已存在`)
      return error
    }
  }
  @silent(["info"])
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
