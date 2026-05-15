import fs from "node:fs/promises";
import { get } from "node:http";
import path from "node:path/posix";
import type {
	Compiler,
	RspackOptions,
	RspackPluginInstance,
} from "@rspack/core";
import packageJson from "./package.json";

interface Option {
	type: "save" | "rerun";
	srcPath: string;
}

// 自己编写的插件
class AutoxDeployPlugin implements RspackPluginInstance {
	private readonly cmd: string;
	private readonly srcPath: string;
	private readonly url: string;
	private readonly package_json: typeof packageJson;

	constructor(option: Option) {
		this.cmd = option.type;
		this.srcPath = path.resolve(option.srcPath);
		this.url = `http://127.0.0.1:9317/exec`;
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		this.package_json = packageJson;
	}

	private async sendUrl() {
		let paramsPath = this.srcPath;
		if (this.cmd === "rerun") {
			paramsPath = path.join(this.srcPath, this.package_json.main);
		}
		const url = `${this.url}?cmd=${this.cmd}&path=${encodeURI(paramsPath)}`;
		return new Promise((resolve, reject) => {
			const req = get(url, (res) => {
				res.setEncoding("utf8");
				if (
					res.statusCode === undefined ||
					res.statusCode < 200 ||
					res.statusCode >= 300
				) {
					return reject(new Error(`请求失败，状态码: ${res.statusCode}`));
				}
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res
					.on("end", () => {
						return resolve(data);
					})
					.on("error", () => {
						reject("返回数据错误");
					});
			});
			req.on("error", () => {
				reject("自动部署失败,autox.js服务未启动\n请启动auto.js服务");
			});
		});
	}

	// private async sendUrl() {
	//   let paramsPath = this.srcPath
	//   if (this.cmd === "rerun") {
	//     paramsPath = path.join(this.srcPath, this.package_json.main)
	//   }
	//   try {
	//     const req = await axios.get(this.url, {
	//       params: {
	//         cmd: this.cmd,
	//         path: paramsPath,
	//       },
	//     })
	//     return req.data
	//   } catch (error) {
	//     return "自动部署失败,autox.js服务未启动\n请启动auto.js服务"
	//   }
	// }

	private async createProjectFile() {
		const dirName = "project.json";
		const projectPath = path.join(this.srcPath, dirName);

		const project = {
			name: this.package_json.name,
			main: this.package_json.main,
			ignore: ["build"],
			packageName: `com.autojs.${this.package_json.name}`,
			versionName: this.package_json.version,
			versionCode: Number(this.package_json.version.split(".")[0]),
		};
		const jsonString = JSON.stringify(project, null, 2);
		try {
			await fs.writeFile(projectPath, jsonString, {
				encoding: "utf8",
				flag: "w+",
			});
			console.info(`已写入${dirName}`);
		} catch (error) {
			console.error(`${dirName}已存在`);
			return error;
		}
	}

	apply(compiler: Compiler) {
		compiler.hooks.done.tap("AutoxDeployPlugin", async () => {
			try {
				await this.createProjectFile();
				const req = await this.sendUrl();
				console.log(`\x1b[32m${req}\x1b[0m`);
			} catch (error) {
				console.error(error);
			}
		});
	}
}

const entry_file = path.resolve("./src/main.ts");
const alias_path = path.resolve("./src/modules");
const output_path = path.resolve("./dist");

export default (env: { RSPACK_WATCH: boolean }) => {
	const isWatch = env.RSPACK_WATCH;

	const config: RspackOptions = {
		devtool: false,
		entry: entry_file,

		mode: "production",
		target: ["web", "es3"],
		output: {
			path: output_path,
		},

		plugins: [
			new AutoxDeployPlugin({
				type: isWatch ? "rerun" : "save",
				srcPath: output_path,
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
			minimize: !isWatch,
		},
		externalsType: "commonjs",
		externals: { "lodash-es": "lodash" },
	};

	if (isWatch) {
		console.log("开启监听模式");
	} else {
		console.log("开始打包");
	}

	return config;
};
