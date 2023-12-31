const mongoose = require('mongoose');
const raffleEntrySchema = require('./raffle-entry-schema');
const { Schema } = mongoose;

const pastRaffleSchema = new Schema({
	_id: String,
	channelId: String,
	prize: String,
	description: String,
	date: Number,
	noOfWinners: Number,
	entries: [raffleEntrySchema],
	winners: Array,
});

const PastRaffle = mongoose.model('Past-Raffle', pastRaffleSchema);
module.exports = PastRaffle;
