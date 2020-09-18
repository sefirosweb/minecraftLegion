const express = require('expres');
const message = require('../components/message/network')

const routes = function (server) {
    server.use('/message', message)
}

module.exports = routes