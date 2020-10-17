const store = require('./store')
const socket = require('../../socket').socket

function addMessage (user, message) {
  return new Promise((resolve, reject) => {
    if (!user || !message) {
      console.error('[message controller] No hay usuario o mensaje')
      reject('Los datos son incorrectos')
      return false
    }

    const data = {
      user: user,
      message: message,
      date: new Date()
    }

    const id = store.add(data)

    socket.io.emit('mensaje', data)

    resolve(id)
  })
}

function getMessage (id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      console.error('[message controller] No hay id')
      reject('Los datos son incorrectos')
      return false
    }
    resolve(store.get(id))
  })
}

function getMessages (filter) {
  return new Promise((resolve, reject) => {
    resolve(store.list(filter))
  })
}

function updateMessage (user, message, id) {
  return new Promise((resolve, reject) => {
    if (!user || !message || !id) {
      console.error('[message controller] No hay usuario o mensaje o id')
      reject('Los datos son incorrectos')
      return false
    }

    const data = {
      user: user,
      message: message,
      date: new Date()
    }

    const result = store.update(id, data)
    resolve(result)
  })
}

function deleteMessage (id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      console.error('[message controller] No hay id')
      reject('Los datos son incorrectos')
      return false
    }

    const result = store.delete(id)
    resolve(result)
  })
}

module.exports = {
  getMessage,
  addMessage,
  getMessages,
  updateMessage,
  deleteMessage
}
