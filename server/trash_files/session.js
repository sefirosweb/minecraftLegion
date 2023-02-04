const express = require('express')
const session = require('express-session')

const app = express()

app.use(session({
  resave: false, // No guardar cookie cada vez que hay un cambio
  saveUninitialized: false, // Si no se ha inicializado no la guarde por defecto
  secret: 'ke 312 312 312 312 4312board'
}))

app.get('', (req, res) => {
  // Si existe el .count +1, en caso contrario se setea a 1
  req.session.count = req.session.count ? req.session.count + 1 : 1
  res.status(200).json({
    hello: 'World',
    counter: req.session.count
  })
})

app.listen(4000, () => {
  console.log('Listen http://localhost:4000')
})
