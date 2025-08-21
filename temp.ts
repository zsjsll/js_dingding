import { range, some } from "lodash-es"

/* eslint-disable @typescript-eslint/no-explicit-any */
function logg(prefix: string): MethodDecorator {
  return (_: any, key: symbol | string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value
    descriptor.value = function (...args: any[]) {
      console.log(`${prefix} ${String(key)} called`)
      return original.apply(this, args)
    }
    return descriptor
  }
}

class Logger {
  name = "lll"

  @logg("DEBUG:")
  run() {
    console.log(`Running as ${this.name}`)
  }

  rrr() {
    console.log("rrrr")

    this.run()
  }
}

const logger = new Logger()
logger.rrr()

function c() {
  console.log("c")
}

console.log(c === c.prototype.constructor)

const A = Symbol("pi")
const B = Symbol("pi")

const cc = {}

Reflect.set(cc, A, 3.14)
Reflect.set(cc, B, 11)

console.log(cc)

console.log(Array(9))

const s = some(range(10), (v) => {
  const i = v + 1
  console.log(i)

})
console.log("----->[s] =", s)
