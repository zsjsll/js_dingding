interface BaseApp {
  init(): boolean
  open(): boolean
  run(): boolean
  close(): boolean

  config: object
}

class QQ implements BaseApp {
  config: object

  constructor(config: object) {
    this.config = config
  }


}
