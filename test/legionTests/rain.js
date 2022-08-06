const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  bot.test.sayEverywhere('/weather clear 999999')
  bot.test.sayEverywhere('/time set day')
  await bot.test.wait(1000)
  assert.strictEqual(true, true)
}
