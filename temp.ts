import { includes, replace } from "lodash"

const a = "[qqq]nihao[world]hah[]"

const b = "2131241587612"


const d = b.replace(/\[.*?\]/, "")
console.log(d)
