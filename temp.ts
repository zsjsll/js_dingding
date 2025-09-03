interface LogOptions {
  showArgs?: boolean
  showResult?: boolean
  showTime?: boolean
}

function LogMethod(options: LogOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const start = performance.now()

      if (options.showArgs) {
        console.log(`[${propertyKey}] 参数:`, args)
      }

      const result = originalMethod.apply(this, args)

      if (options.showResult) {
        console.log(`[${propertyKey}] 返回值:`, result)
      }

      if (options.showTime) {
        const end = performance.now()
        console.log(`[${propertyKey}] 执行时间: ${(end - start).toFixed(2)}ms`)
      }

      return result
    }

    return descriptor
  }
}

class MathOps {
  @LogMethod({ showArgs: true, showResult: true, showTime: true })
  compute(a: number, b: number): number {
    return a * b + Math.sqrt(a + b)
  }
}
