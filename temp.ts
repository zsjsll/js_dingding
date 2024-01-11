function A(f: (...aa: Array<any>) => unknown) {
    return (...args: [number]) => {
        console.log(123123)
        return f(...args)
    }
}

const b = A((a, b) => a + b)
console.log(b(1, 2))
