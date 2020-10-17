const store = require('./store')

const thisController = '[filr controller]'

function add (user, file) {
  return new Promise((resolve, reject) => {
    if (!user || !file) {
      console.error(thisController, 'No hay usuario o archivo')
      reject('Los datos son incorrectos')
      return false
    }

    console.log(file)
    const data = {
      user: user,
      fileName: file.originalname,
      tempFileName: file.filename,
      fileUrl: file.destination,
      size: file.size,
      mimetype: file.mimetype,
      encoding: file.encoding,
      created_at: new Date(),
      updated_at: new Date()
    }

    const id = store.add(data)
    resolve(id)
  })
}

function get (id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      console.error(thisController, 'No hay usuario o mensaje')
      reject('Los datos son incorrectos')
      return false
    }
    resolve(store.get(id))
  })
}

function list (filter) {
  return new Promise((resolve, reject) => {
    resolve(store.list(filter))
  })
}

function update (user, message, id) {
  return new Promise((resolve, reject) => {
    if (!user || !message || !id) {
      console.error(thisController, 'No hay usuario o mensaje')
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

function remove (id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      console.error(thisController, 'No hay usuario o mensaje')
      reject('Los datos son incorrectos')
      return false
    }

    const result = store.delete(id)
    resolve(result)
  })
}

module.exports = {
  get,
  add,
  list,
  update,
  delete: remove
}
