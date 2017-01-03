const axios = require('axios')
const qs = require('qs')

module.exports = {
    getToken: () => {
        return axios.post('https://api.yelp.com/oauth2/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: 'OGQ2kCVSiw9I72mHr_o4Ag',
            client_secret: 'GD7AMyjJT8FmrBhGuJh7EtqcksCk9r3mmGn7d68Z1bNVcVvBexzPBJ3DXgktRqj4'
        }))
    },

    search: (token, location) => {
        return axios.get('https://api.yelp.com/v3/businesses/search', {
            params: {
                location,
                categories: 'bars,pubs,nightlife',
                sort_by: 'rating',
                radius: 20000,
                limit: 50,
            },

            headers: {
                Authorization: 'Bearer ' + token
            }
        })
    }
}
