const mongoose = require('mongoose');
const { Schema } = mongoose;

const upcomingRaffleSchema = new Schema({
	_id: String,
	channelId: String,
	prize: String,
	description: String,
	date: Number,
	noOfWinners: Number,
	entries: Array,
});

const UpcomingRaffle = mongoose.model('Upcoming-Raffle', upcomingRaffleSchema);
module.exports = UpcomingRaffle;
