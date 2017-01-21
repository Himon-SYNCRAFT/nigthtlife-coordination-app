'use strict'

const yelp = require('./yelp')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const TWITTER_CONSUMER_KEY = 'ghDimAJtos2LhBCjjmoXZXIJe'
const TWITTER_CONSUMER_SECRET = '0trz1qTQw1mD0gQpfkaBAJPSLvc16s8dEDStGvutcDsTWoBe6y'
const TWITTER_CALLBACK_URL = 'http://localhost:3000/twitter/callback'

const tokenName = 'nightlife'
let now = () => {
    return (new Date()).toISOString().slice(0,10).replace(/-/g,"")
}

let Twitter

module.exports = (app, db) => {

    const tokensCollection = db.collection('tokens')
    const usersCollection = db.collection('users')
    const businessesCollection = db.collection('businesses')

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

    app.get('/api/businesses/:id/toggleAssignment', (req, res) => {
        if (!req.user) {
            res.sendStatus(401)
        } else {
            const businessId = req.params.id
            const userId = req.user._id.toString()

            businessesCollection.findOne({ businessId }, (err, doc) => {
                if (err) {
                    throw err
                } else if (!doc) {
                    let businessToAdd = {
                        businessId,
                        users: {}
                    }

                    businessToAdd.users[now()] = [userId]

                    businessesCollection.insertOne(businessToAdd, (err, doc) => {
                        if (err) {
                            throw err
                        } else {
                            doc.going = true
                            doc.users_count = 1
                            res.send(doc)
                        }
                    })
                } else {
                    if (!doc.users[now()]) {
                        doc.users[now()] = [userId]
                    } else {
                        if (doc.users[now()]) {
                            const indexOfUserId = doc.users[now()].indexOf(userId)

                            if (indexOfUserId == -1) {
                                doc.users[now()].push(userId)
                                doc.going = true
                                doc.users_count = doc.users[now()].length
                            } else {
                                doc.users[now()].splice(indexOfUserId, 1)
                                doc.going = false
                                doc.users_count = doc.users[now()].length
                            }
                        }
                    }

                    businessesCollection.save(doc)
                    res.send(doc)
                }
            })
        }
    })

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
                            const businessesId = response.data.businesses.map(item => {
                                return item.id
                            })

                            let docs = businessesCollection.find({ businessId: { $in: businessesId } }).toArray()

                            docs.then((docs) => {
                                let businesses = response.data.businesses.map(business => {
                                    business.users_count = 0
                                    business.going = false

                                    if (req.user) {
                                        const userId = req.user._id.toString()

                                        for (let i = 0; i < docs.length; i++) {
                                            let doc = docs[i]

                                            if (doc.businessId == business.id && doc.users && doc.users[now()]) {
                                                business.users_count = doc.users[now()].length
                                                business.going = doc.users[now()].indexOf(userId) != -1
                                            }
                                        }
                                    }

                                    return business
                                })

                                response.data.businesses = businesses
                                res.json(response.data)
                            })

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
