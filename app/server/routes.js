'use strict'

const yelp = require('./yelp')
const tokenName = 'nightlife'

module.exports = (app, db) => {
    let tokensCollection = db.collection('tokens')

    app.route('/api/search/:location/')
        .get((req, res) => {
            const location = req.params.location

            tokensCollection.findOne({ name: tokenName }, (err, doc) => {
                if (err) {
                    throw err
                } else if (!doc) {
                    yelp.getToken()
                        .then(response => {
                            tokensCollection.insertOne({
                                name: tokenName,
                                data: response.data
                            }, (err, doc) => {
                                if (err) {
                                    throw err
                                }

                                yelp.search(response.data.access_token, location)
                                    .then(response => {
                                        res.json(response.data)
                                    })
                                    .catch(error => {
                                        console.log(error)
                                        res.end()
                                    })
                            })
                            res.json(response.data)
                        })
                } else {
                    const token = doc.data.access_token
                    yelp.search(token, location)
                        .then(response => {
                            res.json(response.data)
                        })
                        .catch(error => {
                            console.log(error)
                            res.end()
                        })
                }
            })
        })

    app.route('/api/*')
        .get(abort404)

    app.route('*')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/public/index.html')
        })
}

function abort404(req, res) {
    res.status(404)
    res.end()
}
