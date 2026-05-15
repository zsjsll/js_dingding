import * as _ from "lodash-es";
import type { AppPackages, Info, ListenerCfg } from "@/types";
import { ctrl, tools } from "./tools";

export default class Listener {
	constructor(cfg: ListenerCfg) {
		this.OBSERVE_VOLUME_KEY_UP = cfg.OBSERVE_VOLUME_KEY_UP;
		this.OBSERVE_VOLUME_KEY_DOWN = cfg.OBSERVE_VOLUME_KEY_DOWN;
		this.NOTIFICATIONS_FILTER = cfg.NOTIFICATIONS_FILTER;
		this.PACKAGES = cfg.PACKAGES;
	}
	private readonly OBSERVE_VOLUME_KEY_UP: boolean;
	private readonly OBSERVE_VOLUME_KEY_DOWN: boolean;
	private readonly PACKAGES: AppPackages;
	private readonly NOTIFICATIONS_FILTER: boolean;

	// eslint-disable-next-line sonarjs/public-static-readonly
	static debug: (e?: android.view.KeyEvent) => unknown;

	listenVolumeKey() {
		events.setKeyInterceptionEnabled("volume_up", this.OBSERVE_VOLUME_KEY_UP);
		events.setKeyInterceptionEnabled(
			"volume_down",
			this.OBSERVE_VOLUME_KEY_DOWN,
		);
		if (this.OBSERVE_VOLUME_KEY_UP || this.OBSERVE_VOLUME_KEY_DOWN)
			events.observeKey();

		if (this.OBSERVE_VOLUME_KEY_UP) {
			events.on("key", (keycode: number, event: android.view.KeyEvent) => {
				if (keycode === keys.volume_up && event.getAction() === 0) {
					threads.shutDownAll();
					ctrl.resetPhone();
					toastLog("按下音量+，重启程序!");
					console.log("重写Listener.debug，进行测试");
					if (_.isFunction(Listener.debug)) Listener.debug(event);
					tools.reloadScript();
				}
			});
		}

		if (this.OBSERVE_VOLUME_KEY_DOWN) {
			events.on("key", (keycode: number, event: android.view.KeyEvent) => {
				if (keycode === keys.volume_down && event.getAction() === 0) {
					threads.shutDownAll();
					ctrl.resetPhone();
					toastLog("按下音量-，中断所有子线程!");
					/* 调试脚本*/
				}
			});
		}
	}

	listenNotification(
		func?: (
			notification: org.autojs.autojs.core.notification.Notification,
		) => unknown,
	) {
		events.observeNotification();

		events.on(
			"notification",
			_.throttle(
				(n: org.autojs.autojs.core.notification.Notification) => {
					const info: Info = {
						PACKAGENAME: n.getPackageName(),
						TITLE: n.getTitle(),
						TEXT: n.getText(),
						PRIORITY: n.priority,
						CATEGORY: n.category,
						TIME: tools.formatTime("YYYY-MM-DD HH:mm:ss", n.when),
						NUMBER: n.number,
						TICKER_TEXT: n.tickerText,
					};
					_.forIn(info, (v, k) => console.verbose(`${k}: ${v}`));
					n.delete();
					if (
						!tools.passNotification(
							this.NOTIFICATIONS_FILTER,
							info,
							this.PACKAGES,
						)
					)
						return;
					if (_.isFunction(func)) return func(n);
				},
				0,
				{ leading: true, trailing: false },
			),
		);
	}
}
