// tools.ts
export type Delay = [number, number]

export interface SwipeScreen {
  TIME: number
  START: number
  END: number
}

export type Pause = [number, number]

export type XOY = [number, number]

export type BlackListOptions = string[]
export interface Package {
  PACKAGENAME: string
  APPNAME?: string
  BLACKLISTS?: BlackListOptions[]
}

//listener.ts
export interface ListenerCfg {
  PACKAGES: AppPackages
  OBSERVE_VOLUME_KEY_UP: boolean
  OBSERVE_VOLUME_KEY_DOWN: boolean
  NOTIFICATIONS_FILTER: boolean
}

export interface Info {
  PACKAGENAME: string
  TITLE: string
  TEXT: string
  PRIORITY: number
  CATEGORY: string
  TIME: string
  NUMBER: number
  TICKER_TEXT: string
}

//config.ts

type AppPackagesKey = "HOME" | "QQ" | "DD" | "CLOCK" | "EMAIL" | "XMSF" | "HWID"

export type AppPackages = CreateAppPackages<AppPackagesKey>

export interface Json extends DDCfg, QQCfg, PhoneCfg, ListenerCfg {
  PACKAGES: AppPackages
  GLOBAL_LOG_FILE_DIR: string
  DELAY: Delay
}

export interface Variable {
  ROOT: boolean
  pause: Pause
  thread: org.autojs.autojs.core.looper.TimerThread | undefined
  info: string[]
}

export type Cfg = Variable & Json

// app.ts

type CreateAppPackages<K extends AppPackagesKey> = Record<K, Package> & { HOME: Package }

export interface QQCfg {
  PACKAGES: CreateAppPackages<"QQ">
  RETRY: number
  QQ: string
}

export interface DDCfg {
  PACKAGES: CreateAppPackages<"DD">
  ACCOUNT: string
  PASSWD: string
  RETRY: number
  CORP_ID: string
}

export interface ClockCfg {
  PACKAGES: CreateAppPackages<"CLOCK">
  SWIPESCREEN: SwipeScreen
  RETRY: number
}

export interface EmailCfg {
  PACKAGES: CreateAppPackages<"EMAIL">
}

// Phone.ts

export interface PhoneCfg {
  PACKAGES: CreateAppPackages<"HOME">
  DEV: boolean
  SCREEN_BRIGHTNESS: number
  SWIPESCREEN: SwipeScreen
  VOLUME: number
}

export enum Step {
  next = "next",
  exit = "exit",
}
