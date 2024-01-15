import JSON5 from 'json5'
const obj = {
  name: 'keliq',
  age: 12,
}
const res = JSON5.stringify(obj)
console.log(res) // {name:'keliq',age:12}