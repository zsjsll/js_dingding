var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { posix } from "path";
import axios from "axios";
import fs from "fs/promises";
function silent(consolePropKey) {
    const keys = new Set(consolePropKey);
    return (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const originalConsole = { ...console };
            const restore = () => {
                keys.forEach((key) => {
                    console[key] = originalConsole[key];
                });
            };
            const result = originalMethod.apply(this, args);
            if (result instanceof Promise) {
                result.finally(() => restore());
            }
            else {
                restore();
            }
            return result;
        };
    };
}
class AutoxDeployPlugin {
    cmd;
    dir;
    hook;
    url;
    project;
    constructor(option) {
        this.cmd = option.params;
        this.dir = posix.resolve(option.package_json.dist.dir);
        if (option.hook)
            this.hook = option.hook;
        else
            this.hook = "writeBundle";
        this.url = "http://127.0.0.1:9317/exec";
        this.project = {
            name: option.package_json.name,
            main: option.package_json.main,
            ignore: ["build"],
            packageName: `com.autojs.${option.package_json.name}`,
            versionName: option.package_json.version,
            versionCode: Number(option.package_json.version.split(".")[0]),
        };
    }
    async sendUrl() {
        try {
            const req = await axios.get(this.url, {
                params: {
                    cmd: this.cmd,
                    path: this.dir,
                },
            });
            console.info(req.data);
        }
        catch (error) {
            console.error("自动部署失败,autox.js服务未启动");
            console.error("请启动auto.js服务");
            return error;
        }
    }
    async createProjectFile() {
        const dirName = "project.json";
        const path = posix.join(this.dir, dirName);
        const jsonString = JSON.stringify(this.project, null, 2);
        try {
            await fs.writeFile(path, jsonString, { encoding: "utf8", flag: "w+" });
            console.info(`已写入${dirName}`);
        }
        catch (error) {
            console.error(`${dirName}已存在`);
            return error;
        }
    }
    getPlugin() {
        return {
            name: "AutoxDeploy",
            [this.hook]: async () => {
                await this.createProjectFile();
                this.sendUrl();
            },
        };
    }
}
__decorate([
    silent(["info"])
], AutoxDeployPlugin.prototype, "sendUrl", null);
__decorate([
    silent(["info"])
], AutoxDeployPlugin.prototype, "createProjectFile", null);
export default function autoxDeployPlugin(options) {
    const instance = new AutoxDeployPlugin(options);
    return instance.getPlugin();
}
