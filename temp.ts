const a = {
  b: 123,
  ...(true && { c: 2 }),
}

const aa = false && { c: 2 }
console.log(aa)

const bb=...{false}

console.log(bb)
