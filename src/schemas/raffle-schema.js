const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleSchema = new Schema({
	_id: String,
	channelId: String,
	prize: String,
	date: Number,
	noOfWinners: Number,
	entries: Array,
});

const Raffle = mongoose.model('Raffle', raffleSchema);
module.exports = Raffle;
