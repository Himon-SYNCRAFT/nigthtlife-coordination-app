const axios = require('axios')

const instance = axios.create({
    baseURL: 'http://localhost:3000/api/',
    timeout: 10000
})

module.exports = {
    businesses: {
        getByLocation: (location) => {
            return instance.get('/search/' + location)
        },

        toggleAssignment: (businessId) => {
            return instance.get('/businesses/' + businessId + '/toggleAssignment')
        }
    }
}
