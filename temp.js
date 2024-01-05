/**
 * 柯里化函数
 *
 * @param {Function} fn
 * @param {*} args
 * @return {*}
 */
function createCurry(fn, args) {
    /**
     *
     *
     * @param {object} a arguments
     * @param {number} start
     * @param {number} end
     * @return {Array}
     */
    function toArray(a, start, end) {
        return Array.prototype.slice.call(a, start, end)
    }

    // @ts-ignore
    args = toArray(arguments, 1)

    if (fn.length <= args.length) return fn.apply(null, args)
    else {
        return function (_args) {
            // @ts-ignore
            _args = [fn].concat(args).concat(toArray(arguments))
            return createCurry.apply(null, _args)
        }
    }
}

function aaa(a, b, c) {
    return a + b + c
}

console.log(aaa.length)

let o = { a: 1, b: 2, c: 3 }

for (let k in o) {
    o[k] = o[k] + 1
}

console.log(o)
