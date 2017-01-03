const AppDispatcher = require('../dispatcher/AppDispatcher')
const BusinessesConstants = require('../constants/BusinessesConstants')
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
}

module.exports = BusinessesActions

