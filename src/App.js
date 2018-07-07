import React, { Component } from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import cn from 'classnames'
import './App.css'
import Main from './components/Main/Main'
import Event from './components/Event/Event'
import BookNow from './components/BookNow/BookNow'
import * as Spinner from 'ladda';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      slug: props.match.params.room,
      now: moment(),
      schedule: [],
      isLoading: true,
      isAvailable: false,
      currentEvent: null,
      nextEvent: null,
      nextFreeSlot: null,
    }
  }

  componentWillMount() {
    this.fetchSchedule();
    this.fetchInterval = setInterval(() => this.fetchSchedule(), 30 * 1000);
    this.updateInterval = setInterval(() => this.updateTime(), 1 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    clearInterval(this.updateInterval);
  }

  render() {
    const { name, now, isLoading, isAvailable, nextEvent, nextFreeSlot } = this.state

    let mainProps;
    let state = 'free';
    if (!isAvailable) {
      const busyUntil = nextFreeSlot ? moment(nextFreeSlot.start) : now.endOf('day');
      mainProps = { label: 'busy until', time: busyUntil.format('h:mm') };
      state = 'busy';
    } else if (nextEvent) {
      const freeUntil = moment(nextEvent.start);
      mainProps = { label: 'free until', time: freeUntil.format('h:mm') };
    } else {
      mainProps = { label: '', time: 'free' };
    }

    return (
      !isLoading && (
        <div className={cn('App', state)}>
          <Helmet>
            <title>{name}</title>
            <link rel="icon" type="image/x-icon" href={`/${state}.ico`} />
          </Helmet>
          <Main {...mainProps}>
            { this.renderNextAvailable() }
          </Main>
          { this.renderNextScheduled() }
        </div>
      )
    );
  }

  renderNextAvailable() {
    const { now, isAvailable, nextEvent } = this.state
    const slots = isAvailable && getNextAvailable(now, nextEvent);
    return slots && (
      <div className='slots-list'>
        {slots.map(when => {
          const props = {key: when, book: this.book, when: when};
          return (<BookNow {...props} />);
        })}
      </div>
    );
  }

  renderNextScheduled() {
    const { now, schedule, currentEvent } = this.state
    const events = schedule.filter((e) => !e.available && now.isBefore(e.end))
    return (events.length > 0) && (
      <div className='event-list'>
        {events.map((event) => {
          const props = {key: event.start, current: event == currentEvent, event}
          return (<Event {...props} />);
        })}
      </div>
    );
  }

  fetchSchedule = () => {
    fetch(`/api/rooms/${this.state.slug}`)
      .then(this.handleErrors)
      .then(this.parseResponse)
      .then(this.refresh);
  }

  book = (until, e) => {
    const spinner = Spinner.create(e.target);
    spinner.start();
    fetch(`/api/rooms/${this.state.slug}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ end: until.toISOString() }),
      })
      .then(this.handleErrors)
      .then(this.parseResponse)
      .then((response) => {
        spinner.stop();
        this.refresh(response);
      });
  }

  updateTime = () => {
    const { schedule } = this.state
    const now = moment()
    const currentEvent = schedule.find(slot => now.isBetween(slot.start, slot.end)) || null
    const nextEvent = schedule.find(slot => !slot.available && now.isBefore(slot.start)) || null
    const nextFreeSlot = schedule.find(slot => slot.available && now.isBefore(slot.start)) || null
    const isAvailable = currentEvent ? currentEvent.available : false
    const isLoading = currentEvent ? false : true
    this.setState({ now, isLoading, isAvailable, currentEvent, nextEvent, nextFreeSlot })
  }

  refresh = ({ name, schedule }) => {
    this.setState({ name, schedule: dedupe(schedule) }, this.updateTime)
  }

  handleErrors = (response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  parseResponse = (response) => response.json();
}

//  Identify next available meeting end times
const getNextAvailable = function(now, nextEvent, options = {}) {
  const defaults = { count: 2, interval: 30 }
  const { count, interval } = {...defaults, ...options};

  let slots = [];

  //  Create <count> slots <interval> minutes apart
  const hour = moment(now).startOf('hour');
  for (let i = 1; i <= count; i++) {
    slots.push(hour.clone().add(interval * i, 'minutes'));
  }

  //  Shift all slots until the first one is in the future
  while (slots[0].isBefore(now.clone().add(2, 'minutes'))) {
    slots.forEach(slot => slot.add(interval, 'minutes'));
  }

  // Drop/truncate slots after the next event
  if (nextEvent) {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].isAfter(nextEvent.start)) {
        if (i === 0 || slots[i - 1].isBefore(nextEvent.start)) {
          slots[i] = moment(nextEvent.start);
          slots = slots.slice(0, i + 1);
        } else { // the previous slot equals the next event start
          slots = slots.slice(0, i);
        }
        break;
      }
    }
  }

  return slots;
}

//  Filter duplicate events
const dedupe = function(schedule) {
  let uniq = [];
  schedule.forEach(nextEvent => {
    if (!uniq.find(uniqEvent => isSameTime(uniqEvent, nextEvent))) {
      uniq.push(nextEvent);
    }
  });
  return uniq;
}

//  Test if two events are duplicates
const isSameTime = (a, b) => a.start === b.start && a.end === b.end;
