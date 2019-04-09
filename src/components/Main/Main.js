import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import "./Main.css";

export default class Main extends PureComponent {
	static propsTypes = {
		label: PropTypes.string,
		time: PropTypes.string,
		children: PropTypes.element,
		intl: PropTypes.any
	};

	static defaultProps = {
		label: "",
		time: ""
	};

	render() {
		const { children, label, time, intl } = this.props;
		let minutes;

		// if the label ends with a "for" word, display a special "minutes" appendinx
		const forWord = intl.formatMessage({
			id: "for"
		});

		if (label.endsWith(forWord)) {
			minutes = (
				<span className="minuteLabel">
					<FormattedMessage id="minutes" />
				</span>
			);
		}

		return (
			<div className="Main">
				<div className="label">{label}</div>
				<div className="time">
					<FormattedMessage id={time} defaultMessage={time} />
				</div>
				{minutes}
				{children}
			</div>
		);
	}
}
