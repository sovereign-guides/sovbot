const mongoose = require('mongoose');
const { Schema } = mongoose;
const raffleEntrySchema = require('./raffle-entry-schema');

const upcomingRaffleSchema = new Schema({
	_id: String,
	channelId: String,
	prize: String,
	description: String,
	date: Number,
	noOfWinners: Number,
	entries: [raffleEntrySchema],
});

const UpcomingRaffle = mongoose.model('Upcoming-Raffle', upcomingRaffleSchema);

module.exports = upcomingRaffleSchema;
module.exports = UpcomingRaffle;
