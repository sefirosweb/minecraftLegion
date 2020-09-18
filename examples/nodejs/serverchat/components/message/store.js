
const MongoLib = require('../../network/MongoLib');
const db = new MongoLib;
// const Model = require('./model')

db.connect();

async function addMessage(message) {
    return db.create('message', message)
        .then(result => {
            return result;
        })
        .catch(err => {
            return err;
        });
}

function getMessages(filterUser) {
    let filter = {};
    if (filterUser !== null) {
        filter = { user: filterUser }
    }

    return db.getAll('message', filter)
        .then(result => {
            return result
        })
        .catch(err => {
            return err;
        })
}

function getMessage(id) {
    return db.get('message', id)
        .then(result => {
            return result
        })
        .catch(err => {
            return err;
        })
}


function updateMessage(id, message) {
    return db.update('message', id, message)
        .then(result => {
            return result
        })
        .catch(err => {
            return err;
        })
}

function deleteMessage(id) {
    return db.delete('message', id)
        .then(result => {
            return result
        })
        .catch(err => {
            return err;
        })
}

module.exports = {
    get: getMessage,
    add: addMessage,
    list: getMessages,
    update: updateMessage,
    delete: deleteMessage
}
