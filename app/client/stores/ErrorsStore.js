const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const ErrorsConstants = require('../constants/ErrorsConstants')
const assign = require('object-assign')

const CHANGE = 'CHANGE ERRORS'
let errors = []

const ErrorsStore = assign({}, EventEmitter.prototype, {
    get: () => {
        rv = errors
        errors = []
        return rv
    },

    getLast: () => {
        if (errors.len > 0) {
            return errors.pop()
        }
    },

    addChangeListener: function(callback) {
        this.on(CHANGE, callback)
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE, callback)
    },

    addUnauthorizedListener: function(callback) {
        this.on(ErrorsConstants.UNAUTHORIZED_ERROR, callback)
    },

    removeUnauthorizedListener: function(callback) {
        this.removeListener(ErrorsConstants.UNAUTHORIZED_ERROR, callback)
    }
})

AppDispatcher.register(action => {

    switch (action.actionType) {
        case ErrorsConstants.UNAUTHORIZED_ERROR:
            ErrorsStore.emit(ErrorsConstants.UNAUTHORIZED_ERROR)
            break
    }
})

module.exports = ErrorsStore


