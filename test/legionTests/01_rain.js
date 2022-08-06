const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  await bot.test.wait(1000)
  assert.strictEqual(true, true)
}
