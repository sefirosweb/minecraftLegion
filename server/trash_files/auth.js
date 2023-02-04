const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
const secretKey = 'secretKey'

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Nodejs'
  })
})

app.post('/login', (req, res) => {
  const user = {
    id: 1,
    nombre: 'TestUser'
  }

  // Expira en 300 segundos
  jwt.sign({ user }, secretKey, { expiresIn: '300s' }, (err, token) => {
    if (err) {
      console.log(err)
    }
    res.json({
      token
    })
  })
})

app.post('/post', verifyToken, (req, res) => {
  jwt.verify(req.token, secretKey, (err, authData) => {
    if (err) {
      res.sendStatus(403)
    } else {
      res.json({
        msg: 'Post fue creado!',
        authData
      })
    }
  })
})

// Middleware
function verifyToken (req, res, next) {
  // Header: Authorization: Bearer <token>
  const bearerHeader = req.headers.authorization
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1] // <token>
    req.token = bearerToken
    next()
  } else {
    res.sendStatus(403)
  }
}

const listenPort = 4000
app.listen(listenPort, () => {
  console.log(`Listen http://localhost:${listenPort}`)
})
