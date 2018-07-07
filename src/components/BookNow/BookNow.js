import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import './BookNow.css'

export default class BookNow extends Component {

  static propTypes = {
    book: PropTypes.func,
    when: PropTypes.object
  }

  static defaultProps = {
    book: () => { },
    when: null
  }

  reserve(e) {
    const { book, when } = this.props

    return book(when, e);
  }

  render() {
    const { when } = this.props

    const duration = moment.duration(when.diff(moment())).humanize();

    return (
      <button className="BookNow" onClick={this.reserve.bind(this)}>
        <div>{`Book until ${when.format('h:mm')}`}</div>
        <div>{`(${duration})`}</div>
      </button>
    )
  }

}
