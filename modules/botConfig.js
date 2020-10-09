const low = require('lowdb');
const Filesync = require('lowdb/adapters/FileSync');

function getConn(botName) {
    const adapter = new Filesync('./botConfig/' + botName + '.json')
    const db = low(adapter);
    const defaultConfig = {
        name: botName,
        job: 'guard', // guard, archer, farmer
        mode: 'none', // none, pve, pvp
        distance: 10,
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

function getJob(botName) {
    const db = getConn(botName);
    return db.get('config.job').value();
}

function setMode(botName, mode) {
    const db = getConn(botName);
    db.set('config.mode', mode).write()
}

function getMode(botName) {
    const db = getConn(botName);
    return db.get('config.mode').value();
}

function setDistance(botName, distance) {
    const db = getConn(botName);
    db.set('config.distance', distance).write()
}

function getDistance(botName) {
    const db = getConn(botName);
    return db.get('config.distance').value();
}

function setPatrol(botName, patrol) {
    const db = getConn(botName);
    db.set('config.patrol', patrol).write()
}

function getPatrol(botName) {
    const db = getConn(botName);
    return db.get('config.patrol').value();
}


module.exports = {
    setJob,
    getJob,
    setMode,
    getMode,
    setDistance,
    getDistance,
    setPatrol,
    getPatrol,
}