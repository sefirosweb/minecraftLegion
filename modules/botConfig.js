const low = require('lowdb');
const Filesync = require('lowdb/adapters/FileSync');

function getConn(botName) {
    const adapter = new Filesync('./botConfig/' + botName + '.json')
    const db = low(adapter);
    const defaultConfig = {
        name: botName,
        job: 'guard', // guard, archer, farmer
        mode: 'none', // none, pve, pvp
        help_friends: false,
        patrol: []
    };

    db.defaults({ config: defaultConfig }).write();
    return db;
}

function setJob(botName, job) {
    const db = getConn(botName);
    db.set('config.job', job).write()
}

function loadJob(botName) {
    const db = getConn(botName);
    const job = db.get('config.job').value();
    return job;
}

module.exports = {
    setJob,
    loadJob
}