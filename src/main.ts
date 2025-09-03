import { showToast } from "autox-v7-api/toast"
import { ra } from "./mmo.js"

function demo(a: string) {
  console.log(a)
  showToast(a)
}

demo("hello world")

console.log(ra(2, 3)) // 5
