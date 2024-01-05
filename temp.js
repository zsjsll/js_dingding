/**
 *
 *
 * @param {Function} fn
 * @return {*}
 */
function curry(fn, args) {
    let slice = Array.prototype.slice
    args = slice.call(arguments, 1)
    console.log("[ args ]-10", args)

    if (fn.length <= args.length) return fn.apply(null, args)
    else {
        return function (_args) {
            console.log("[ _args ]-16", arguments)
            _args = slice.call(arguments, 0)
            console.log("[ _args ]-17", _args)
            args = args.concat(_args)
            args.unshift(fn)
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
console.log(b(2) (3))
