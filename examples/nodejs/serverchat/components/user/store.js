
const MongoLib = require('../../network/MongoLib')
const db = new MongoLib()
// const Model = require('./model')

db.connect()

async function addUser (User) {
  return db.create('User', User)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function getUsers (data) {
  let filter = {}
  if (data !== null) {
    filter = { user: data }
  }

  return db.getAll('User', filter)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function getUser (id) {
  return db.get('User', id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function updateUser (id, message) {
  return db.update('User', id, message)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function deleteUser (id) {
  return db.delete('User', id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

module.exports = {
  get: getUser,
  add: addUser,
  list: getUsers,
  update: updateUser,
  delete: deleteUser
}
