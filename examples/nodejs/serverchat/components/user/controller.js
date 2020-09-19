const store = require('./store');

function addUser(user) {
    return new Promise((resolve, reject) => {
        if (!user) {
            console.error('[user controller] No hay usuario');
            reject('Los datos son incorrectos');
            return false;
        }

        const data = {
            user: user,
            date: new Date(),
        }

        const id = store.add(data);
        resolve(id);
    });
}

function getUser(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            console.error('[user controller] No hay id');
            reject('Los datos son incorrectos');
            return false;
        }
        resolve(store.get(id))
    });
}

function getUsers(filter) {
    return new Promise((resolve, reject) => {
        resolve(store.list(filter))
    });
}

function updateUser(user, id) {
    return new Promise((resolve, reject) => {
        if (!user || !id) {
            console.error('[user controller] No hay usuario o id');
            reject('Los datos son incorrectos');
            return false;
        }

        const data = {
            user: user,
            date: new Date(),
        }

        const result = store.update(id, data);
        resolve(result);
    });
}

function deleteUser(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            console.error('[user controller] No hay id');
            reject('Los datos son incorrectos');
            return false;
        }

        const result = store.delete(id);
        resolve(result);
    });
}

module.exports = {
    getUser,
    addUser,
    getUsers,
    updateUser,
    deleteUser
}