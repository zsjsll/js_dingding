interface Test {
  a: string
  b: number
  c: boolean
}

type H = "a" | "b" | "c"

type AA<T, K> = T extends K ? never : T

type PP<T, K extends keyof T> = { [U in K]: T[U] }

const a: AA<H, "a"> = "a"
