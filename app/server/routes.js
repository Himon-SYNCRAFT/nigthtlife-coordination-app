'use strict'

const yelp = require('./yelp')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const TWITTER_CONSUMER_KEY = 'ghDimAJtos2LhBCjjmoXZXIJe'
const TWITTER_CONSUMER_SECRET = '0trz1qTQw1mD0gQpfkaBAJPSLvc16s8dEDStGvutcDsTWoBe6y'
const TWITTER_CALLBACK_URL = 'http://localhost:3000/twitter/callback'

const tokenName = 'nightlife'

let Twitter

module.exports = (app, db) => {

    const tokensCollection = db.collection('tokens')
    const usersCollection = db.collection('users')

    passport.use(new TwitterStrategy(
        {
            consumerKey: TWITTER_CONSUMER_KEY,
            consumerSecret: TWITTER_CONSUMER_SECRET,
            callbackURL: TWITTER_CALLBACK_URL
        },

        (token, tokenSecret, profile, done) => {
            usersCollection.findOne({'twitterId': profile.id}, (err, user) => {
                const data = {
                    name: profile.username,
                    twitterId: profile.id,
                }

                if (!user) {
                    usersCollection.insertOne({ name: profile.name, twitterId: profile.id }, (err, doc) => {
                        if (doc) {
                            data._id = doc.insertedId
                        }
                        done(err, data)
                    })
                } else {
                    done(err, user)
                }
            })
        }
    ))

    passport.serializeUser((user, done) => {
        const data = {
            name: user.username,
            twitterId: user.id,
        }

        done(null, data)
    })

    passport.deserializeUser((data, done) => {

        usersCollection.findOne({'twitterId': data.twitterId}, (err, user) => {
            if (!user) {
                usersCollection.insertOne({ name: data.name, twitterId: data.twitterId }, (err, doc) => {
                    if (doc) {
                        data._id = doc.insertedId
                    }
                    done(err, data)
                })
            } else {
                done(err, user)
            }
        })
    })

    app.get('/auth/twitter', passport.authenticate('twitter'))

    app.get('/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/loginFailed'
    }))

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
