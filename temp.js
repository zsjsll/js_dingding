/**
 *
 *
 * @param {Function} fn
 * @return {*}
 */
function curry(fn, args) {
    function toArray(a) {
        return Array.prototype.slice.call(a)
    }

    let args_list = toArray(arguments)
    console.log(args_list)

    args = args_list.slice(1)

    if (fn.length <= args.length) return fn.apply(null, args)
    else {
        return function (_args) {
            _args = args_list.concat(toArray(arguments))
            return curry.apply(null, _args)
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
console.log(b(2, 3))
