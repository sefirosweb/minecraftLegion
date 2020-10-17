
const MongoLib = require('../../network/MongoLib')
const db = new MongoLib()
// const Model = require('./model')

db.connect()

const collection = 'file'

async function add (message) {
  return db.create(collection, message)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function list (data) {
  let filter = {}
  if (data !== null) {
    filter = { user: data }
  }

  return db.getAll(collection, filter)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function get (id) {
  return db.get(collection, id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function update (id, message) {
  return db.update(collection, id, message)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function remove (id) {
  return db.delete(collection, id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

module.exports = {
  get,
  add,
  list,
  update,
  delete: remove
}
