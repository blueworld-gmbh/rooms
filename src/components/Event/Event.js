import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './Event.css'

export default class Event extends PureComponent {

  static propsTypes = {
    current: PropTypes.bool,
    event: PropTypes.object
  }

  static defaultProps = {
    current: false,
    event: null
  }

  render() {
    const { current, event } = this.props
    let time = event ? (current ? event.end : event.start) : 0

    return event && (
<<<<<<< HEAD
      <div className="Event">
        <div className="item">
          <div className="name">{event.summary + (event.private ? ' 👀' : '')}</div>
          <div className="badge">{current ? 'Ends' : 'Starts'} at {moment(time).format('h:mm a')}</div>
        </div>
        <div className="item">
          <div className="name">Another Event that has a long long title</div>
          <div className="badge">Starts at 5:30 pm</div>
        </div>
=======
      <div className="item">
        <div className="name">{event.summary + (event.private ? ' 👀' : '')}</div>
        <div className="badge">{current ? 'Ends' : 'Starts'} at {moment(time).format('h:mm a')}</div>
>>>>>>> New components
      </div>
    )
  }
}
