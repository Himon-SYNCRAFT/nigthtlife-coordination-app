'use strict'

const React = require('react')

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = { search: '' }

        this._onSearchChange = this._onSearchChange.bind(this)
        this._onSubmit = this._onSubmit.bind(this)
    }

    _onSearchChange(event) {
        this.setState({ search: event.target.value })
    }

    _onSubmit(event) {
        event.preventDefault()
    }

    render() {
        let city = this.state.search

        return (
            <div>
                <h1>
                    What's your plan tonight?
                </h1>
                <form onSubmit={this._onSubmit}>
                    <div className="form-group">
                        <input id="city" id="city" placeholder="Where you at?" className="form-control" type="text" value={ this.state.search } onChange={ this._onSearchChange } />
                    </div>
                    <div className="form-group">
                        <button className="btn btn-default">Go</button>
                    </div>
                </form>
            </div>
        )
    }
}

module.exports = Main
