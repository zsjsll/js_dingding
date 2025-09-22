const x = 0
const y = 0
try {
  if (x === 0) throw "x"
  if (y === 0) throw "y"
} catch (error) {
  console.log(error)
}
