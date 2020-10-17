
const MongoLib = require('../../network/MongoLib')
const db = new MongoLib()
// const Model = require('./model')

db.connect()

async function addMessage (message) {
  return db.create('message', message)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function getMessages (data) {
  return new Promise((resolve, reject) => {
    let filter = {}
    if (data !== null) {
      filter = { user: data }
    }

    const messages = db.getAll('message', filter)
    // .populate('user')
    /* .exec((error, populated) => {
                if (error) {
                    reject(error)
                    return false;
                }
                resolve(populated)
            }) */
      .then(result => {
        return result
      })
      .catch(err => {
        reject(err)
      })

    resolve(messages)
  })
}

function getMessage (id) {
  return db.get('message', id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function updateMessage (id, message) {
  return db.update('message', id, message)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

function deleteMessage (id) {
  return db.delete('message', id)
    .then(result => {
      return result
    })
    .catch(err => {
      return err
    })
}

module.exports = {
  get: getMessage,
  add: addMessage,
  list: getMessages,
  update: updateMessage,
  delete: deleteMessage
}
