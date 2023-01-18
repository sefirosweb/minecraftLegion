
type Test = Array<{
    name: string,
    f: () => Promise<void>
}>

const startTests = (tests: Test): Promise<void> => {
    return new Promise(resolve => {
        const test = tests.shift()
        if (!test) {
            resolve()
            return
        }

        console.log(`Starting`, test.name)
        test.f()
            .then(() => {
                return startTests(tests)
            })
            .then(() => {
                resolve()
            })
    })
}

module.exports = startTests