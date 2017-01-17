'use strict'

const express = require('express')
const mongo = require('mongodb').MongoClient
const routes = require('./app/server/routes.js')
const session = require('express-session')
const passport = require('passport')

const app = express()
const port = process.env.PORT || 3000
const connectionString = 'mongodb://tutorial:tutorial@ds151137.mlab.com:51137/clementine'

mongo.connect(connectionString, (err, db) => {
    if (err) {
        throw new Error('DB failed to connect!')
    } else {
        console.log('Connected to DB on port 51137')
    }

    app.use(session({
        secret: '$2a$12$2Z.wdo.8ytoNn6b5faNAt.ywUFo5g2BmbS2FBJAUbg2iUWJc7li9q',
        resave: true,
        saveUninitialized: false
    }))

    app.use('/public', express.static(process.cwd() + '/public'))

    app.use(passport.initialize())
    app.use(passport.session())

    routes(app, db)

    app.listen(port, () => {
        console.log('Listen on port ' + port)
    })
})
