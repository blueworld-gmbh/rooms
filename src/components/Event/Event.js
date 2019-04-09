import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { FormattedMessage } from "react-intl";

import "./Event.css";

export default class Event extends PureComponent {
	static propsTypes = {
		current: PropTypes.bool,
		event: PropTypes.object,
		intl: PropTypes.any
	};

	static defaultProps = {
		current: false,
		event: null
	};

	render() {
		const { current, event, intl } = this.props;
		let time = event ? (current ? event.end : event.start) : 0;

		return (
			event && (
				<div className="event">
					<div className="name">
						{(event.summary ||
							`(${intl.formatMessage({
								id: "noTitle"
							})})`) + (event.private ? " 👀" : "")}
					</div>
					<div className="badge">
						{intl.formatMessage({
							id: current ? "endsAt" : "startsAt"
						})}{" "}
						{moment(time).format("LT")}
					</div>
				</div>
			)
		);
	}
}
