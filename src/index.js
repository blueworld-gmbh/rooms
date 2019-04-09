import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import moment from "moment";

import { IntlProvider, addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";
import de from "react-intl/locale-data/de";
addLocaleData([...en, ...de]);

import App from "./App";
import messages from "./translations";
import "./index.css";

var locale =
	(navigator.languages && navigator.languages[0]) ||
	navigator.language ||
	navigator.userLanguage ||
	"en-US";

moment.locale(locale);

render(
	<IntlProvider locale={locale} messages={messages[locale]}>
		<BrowserRouter>
			<Route path="/:room?" component={App} />
		</BrowserRouter>
	</IntlProvider>,
	document.querySelector("#app")
);
