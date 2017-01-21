const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const BusinessesConstants = require('../constants/BusinessesConstants')
const assign = require('object-assign')

const CHANGE = 'CHANGE BUSINESSES'
let businesses = []

const BusinessesStore = assign({}, EventEmitter.prototype, {
    get: () => {
        return businesses
    },

    addChangeListener: function(callback) {
        this.on(CHANGE, callback)
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE, callback)
    }
})

AppDispatcher.register(action => {

    switch (action.actionType) {
        case BusinessesConstants.GET_ALL:
            businesses = action.data.data.businesses
            BusinessesStore.emit(CHANGE)
            break

        case BusinessesConstants.TOGGLE_ASSIGNMENT:
            const data = action.data.data
            for (let i = 0, len = businesses.length; i < len; i++) {
                if (businesses[i].id == data.businessId) {
                    businesses[i].users_count = data.users_count
                    businesses[i].going = data.going
                }
            }

            BusinessesStore.emit(CHANGE)
            break
    }
})

module.exports = BusinessesStore

