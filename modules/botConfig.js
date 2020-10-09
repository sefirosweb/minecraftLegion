const low = require('lowdb');
const Filesync = require('lowdb/adapters/FileSync');

function getConn(botName) {
    const adapter = new Filesync('./botConfig/' + botName + '.json')
    const db = low(adapter);
    db.defaults({ user: { name: botName } }).write();
    return db;
}

function setJob(botName, job) {
    const db = getConn(botName);
    db.set('user.job', job).write()
}

module.exports = {
    setJob
}