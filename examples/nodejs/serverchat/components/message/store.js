
const MongoLib = require('../../network/MongoLib')
const db = new MongoLib;
// const Model = require('./model')

db.connect();

async function addMessage(message) {
    return db.create('message', message)
        .then(result => {
            return result;
        });
}

function getMessages() {
    return db.getAll('message')
        .then(result => {
            return result
        });
}

function getMessage(id) {
    return db.get('message', id)
        .then(result => {
            console.log(result);
        });
}



module.exports = {
    add: addMessage,
    list: getMessages,
    // get
    // update
    // delete
}
