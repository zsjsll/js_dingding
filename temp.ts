const obj = { a: 1, b: 2, c: 3 }
const k = { a: undefined, b: undefined }
Object.keys(k).forEach((key) => {
  k[key as keyof typeof k] = obj[key as keyof typeof obj]
})
