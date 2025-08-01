import { ECDH } from "crypto"
import { every, includes } from "lodash"

const a = ['1', '2', '3', '4']

const b = every(a, (kw) => includes('nihao 1,jsdk,234', kw))
console.log(b)


function add(a, b) {
  return a + b
}
