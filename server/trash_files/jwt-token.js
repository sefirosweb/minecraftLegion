// https://jwt.io/
// JWT example with command

// Crea un token en base al secretPassword
// node ./examples/jwt-token.js sign test
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJRdWVfaGFjZXNfbWlyYW5kb19lc3RlX3RleHRvX8KswqwiLCJpYXQiOjE2MTIxMTM3MjB9.EkETWyaPZlR6jBi2AIT0C2iOAjxNbSuuhsH6aTKJGmM

// Verifica si el token es correcto cruzandolo con el secretPassword
// node ./examples/jwt-token.js verify eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJRdWVfaGFjZXNfbWlyYW5kb19lc3RlX3RleHRvX8KswqwiLCJpYXQiOjE2MTIxMTM3MjB9.EkETWyaPZlR6jBi2AIT0C2iOAjxNbSuuhsH6aTKJGmM

const jwt = require('jsonwebtoken')
const secretPassword = 'asdasd'

const [, , option, nameOrToken] = process.argv

function signToken (payload, secret) {
  return jwt.sign(payload, secret)
}

function verifyToken (token, secret) {
  return jwt.verify(token, secret)
}

if (option === 'sign') {
  console.log(signToken({ sub: nameOrToken }, secretPassword))
} else if (option === 'verify') {
  console.log(verifyToken(nameOrToken, secretPassword))
} else {
  console.log(('Option needs to be "sign" or "verify'))
}
