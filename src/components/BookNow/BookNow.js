import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

  reserve() {
    const { book, when } = this.props

    return book(when);
  }

  render() {
    const { when } = this.props

    return (
      <button className="BookNow" onClick={this.reserve.bind(this)}>
      {`Book until ${when.format('h:mm')}`}
      </button>
    )
  }

}
