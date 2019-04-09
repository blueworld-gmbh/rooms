const moment = require("moment");
const calendar = require("./calendar");
const express = require("express");
const history = require("connect-history-api-fallback");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/api/rooms/:room", function(req, res, next) {
	if (isValidRequest(req, res, next)) {
		calendar.getSchedule(req.params.room, moment(), (err, schedule) => {
			if (isValidResponse(err, res, next)) {
				res.json({
					name: calendar.getRoomName(req.params.room),
					schedule: schedule
				});
			}
		});
	}
});

// Book a room from now until the specified time
app.post("/api/rooms/:room", function(req, res, next) {
	if (!isValidRequest(req, res, next)) {
		return;
	}

	if (!req.body.end) {
		res.status(400).json({ error: "Parameter missing" });
		next();
		return;
	}

	let start = moment().startOf("minute");
	let end = moment(req.body.end).startOf("minute");

	calendar.getSchedule(req.params.room, start, (err, schedule) => {
		if (isValidResponse(err, res, next)) {
			let freeSlot = schedule.find(s => start.isBetween(s.start, s.end) && s.available);
			if (!freeSlot) {
				res.status(409).json({ error: "Room is busy right now" });
				next();
				return;
			}

			end = moment.min(end, freeSlot.end); // Don't double-book the room
			const event = { start, end, summary: "Flash meeting" };

			console.log(
				`Booking ${req.params.room} ` +
					`from ${start.format("h:mm")} to ${end.format("h:mm")}`
			);

			calendar.bookEvent(req.params.room, event, (err, newEvent) => {
				if (isValidResponse(err, res, next)) {
					schedule.push(newEvent);
					res.json({
						name: calendar.getRoomName(req.params.room),
						schedule: calendar.unifySchedule(schedule)
					});
				}
			});
		}
	});
});

function isValidRequest(req, res, next) {
	if (calendar.roomExists(req.params.room)) {
		return true;
	}

	res.status(404).json({ error: "Room not found" });
	next();
	return false;
}

function isValidResponse(err, res, next) {
	if (err) {
		res.status(500).json({ error: "API Not Available" });
		next();
		return false;
	}
	return true;
}

app.use(history());
app.use(require("nwb/express")(express));
app.use(express.static("public"));

app.listen(port, function(err) {
	if (err) {
		console.error("Error starting server:\n", err.stack);
		process.exit(1);
	}
	console.log("API available at port " + port);
});
