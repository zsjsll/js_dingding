function a(f: (aa?: never) => unknown) {
    return (...args: []) => {
        console.log(123123)
        return () => f(...args)
    }
}
