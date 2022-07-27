const vec3 = require('vec3')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shuffle (array) {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}

const getSecondBlockPosition = (facing, type) => {
  if (type === 'single') {
    return false
  }

  if (facing === 'south' && type === 'right') {
    return vec3(1, 0, 0)
  }

  if (facing === 'south' && type === 'left') {
    return vec3(-1, 0, 0)
  }

  if (facing === 'north' && type === 'left') {
    return vec3(1, 0, 0)
  }

  if (facing === 'north' && type === 'right') {
    return vec3(-1, 0, 0)
  }

  if (facing === 'east' && type === 'right') {
    return vec3(0, 0, -1)
  }

  if (facing === 'east' && type === 'left') {
    return vec3(0, 0, 1)
  }

  if (facing === 'west' && type === 'left') {
    return vec3(0, 0, -1)
  }

  if (facing === 'west' && type === 'right') {
    return vec3(0, 0, 1)
  }

  return false
}

module.exports = {
  sleep,
  shuffle,
  getSecondBlockPosition
}
