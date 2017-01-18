const AppDispatcher = require('../dispatcher/AppDispatcher')
const BusinessesConstants = require('../constants/BusinessesConstants')
const ErrorsConstants = require('../constants/ErrorsConstants')
const Api = require('../Api')

const BusinessesActions = {
    get: (data) => {
        Api.businesses.getByLocation(data)
            .then(response => {
                AppDispatcher.dispatch({
                    actionType: BusinessesConstants.GET_ALL,
                    data: response
                })
            })
    },

    toggleAssignment: (businessId) => {
        Api.businesses.toggleAssignment(businessId)
            .then(response => {
                AppDispatcher.dispatch({
                    actionType: BusinessesConstants.TOGGLE_ASSIGNMENT,
                    data: response
                })
            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            AppDispatcher.dispatch({
                                actionType: ErrorsConstants.UNAUTHORIZED_ERROR,
                            })
                            break
                    }
                }
            })
    }
}

module.exports = BusinessesActions

