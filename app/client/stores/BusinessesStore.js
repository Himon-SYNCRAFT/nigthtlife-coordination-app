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

        case BusinessesConstants.BUSINESS_TOGGLE_ASSIGNMENT:
            BusinessesStore.emit(CHANGE)
            break
    }
})

module.exports = BusinessesStore

