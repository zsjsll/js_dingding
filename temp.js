/**
 *
 *
 * @param {Function} fn
 * @return {*}
 */
function curry(fn, args) {
    console.log(arguments)
    delete arguments["0"]
    console.log(arguments)

    let a = Object.values(arguments)

    console.log(a)

    if (fn.length <= a.length) return fn.apply(null, a)
    else {
        return (_args) => {
            args = Object.values(arguments)
            args.unshift(fn)
            args.push(_args)
            console.log(args)

            return curry.apply(null, args)
        }
    }
}

function add(a, b, c) {
    return a + b + c
}

function t(a) {
    return a
}

let b = curry(add, 1)
console.log(b(2)(3))
