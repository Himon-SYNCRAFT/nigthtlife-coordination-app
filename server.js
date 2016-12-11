'use strict'

const express = require('express')
const mongo = require('mongodb').MongoClient
const routes = require('./app/server/routes.js')

const app = express()
const port = process.env.PORT || 3000
const connectionString = 'mongodb://tutorial:tutorial@ds151137.mlab.com:51137/clementine'

mongo.connect(connectionString, (err, db) => {
    if (err) {
        throw new Error('DB failed to connect!')
    } else {
        console.log('Connected to DB on port 51137')
    }

    app.use('/public', express.static(process.cwd() + '/public'))

    routes(app, db)

    app.listen(port, () => {
        console.log('Listen on port ' + port)
    })
})
