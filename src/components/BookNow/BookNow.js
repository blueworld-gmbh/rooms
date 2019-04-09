import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import "./BookNow.css";
import { FormattedMessage } from "react-intl";

export default class BookNow extends Component {
	static propTypes = {
		book: PropTypes.func,
		when: PropTypes.object,
		intl: PropTypes.any
	};

	static defaultProps = {
		book: () => {},
		when: null
	};

	reserve(e) {
		const { book, when } = this.props;

		return book(when, e);
	}

	render() {
		const { when, intl } = this.props;

		const duration = moment.duration(when.diff(moment())).humanize();
		const hourWord = intl.formatMessage({
			id: "hour"
		});

		// set css class
		let BookNowClass = "BookNow";
		if (duration.endsWith("hour")) {
			BookNowClass = "BookNowHour";
		}

		return (
			<button className={BookNowClass} onClick={this.reserve.bind(this)}>
				<div className="BookHour">
					<FormattedMessage id="bookUntil" values={{ time: when.format("LT") }} />
				</div>
				<div>{`(${duration})`}</div>
			</button>
		);
	}
}
