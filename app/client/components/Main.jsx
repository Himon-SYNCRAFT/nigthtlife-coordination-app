'use strict'

const React = require('react')
const BusinessesStore = require('../stores/BusinessesStore')
const BusinessesActions = require('../actions/BusinessesActions')

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: '',
            businesses: []
        }

        this._onSearchChange = this._onSearchChange.bind(this)
        this._onSubmit = this._onSubmit.bind(this)
        this._onBusinessesChange = this._onBusinessesChange.bind(this)
    }

    componentDidMount() {
        BusinessesStore.addChangeListener(this._onBusinessesChange)
    }

    componentWillUnmount() {
        BusinessesStore.removeChangeListener(this._onBusinessesChange)
    }

    _onBusinessesChange() {
        const businesses = BusinessesStore.get()
        this.setState({ businesses })
        console.log(businesses);
    }

    _onSearchChange(event) {
        this.setState({ search: event.target.value })
    }

    _onSubmit(event) {
        event.preventDefault()
        BusinessesActions.get(this.state.search)
    }

    render() {
        let city = this.state.search
        let items = this.state.businesses.map(item => {
            return <BusinessListItem key={item.id} data={item} />
        })

        let businessList = items.length ? (
            <table className="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Rating</th>
                        <th>Review count</th>
                    </tr>
                </thead>
                <tbody>{items}</tbody>
            </table>
        ) : ''

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
                {businessList}
            </div>
        )
    }
}

class BusinessListItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const img = this.props.data.image_url != '' ? <img className="img-responsive img-rounded" style={{ maxHeight: 140, maxWidth: 140 }} src={this.props.data.image_url} alt={this.props.data.name} /> : ''
        return (
            <tr>
                <td>
                    {img}
                </td>
                <td>
                    <a href={ this.props.data.url }>{ this.props.data.name }</a>
                </td>
                <td>{ this.props.data.location.address1 + ', ' + this.props.data.location.city }</td>
                <td>{ this.props.data.display_phone }</td>
                <td>{ this.props.data.rating }</td>
                <td>{ this.props.data.review_count }</td>
            </tr>
        )
    }
}

module.exports = Main
