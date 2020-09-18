const store = require('./store');

function addMessage(user, message) {
    return new Promise((resolve, reject) => {
        if (!user || !message) {
            console.error('[messageController] No hay usuario o mensaje');
            reject('Los datos son incorrectos');
            return false;
        }


        const fullMessage = {
            user: user,
            message: message,
            date: new Date(),
        }

        const id = store.add(fullMessage);
        resolve(id);
    });
}

function getMessage(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            console.error('[messageController] No hay usuario o mensaje o id');
            reject('Los datos son incorrectos');
            return false;
        }
        resolve(store.get(id))
    });
}


function getMessages() {
    return new Promise((resolve, reject) => {
        resolve(store.list())
    });
}

function updateMessage(user, message, id) {
    return new Promise((resolve, reject) => {
        if (!user || !message || !id) {
            console.error('[messageController] No hay usuario o mensaje o id');
            reject('Los datos son incorrectos');
            return false;
        }

        const fullMessage = {
            user: user,
            message: message,
            date: new Date(),
        }

        const result = store.update(id, fullMessage);
        resolve(result);
    });
}

function deleteMessage(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            console.error('[messageController] No hay usuario o mensaje o id');
            reject('Los datos son incorrectos');
            return false;
        }

        const result = store.delete(id);
        resolve(result);
    });
}
module.exports = {
    getMessage,
    addMessage,
    getMessages,
    updateMessage,
    deleteMessage
}