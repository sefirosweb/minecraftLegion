
const startTests = (tests) => {
    return new Promise(resolve => {
        if (tests.length === 0) {
            resolve()
            return
        }

        const test = tests.shift()
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