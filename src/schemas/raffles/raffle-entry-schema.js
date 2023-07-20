const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleEntrySchema = new Schema({
	_id: String,
	vodLink: String,
	focus: String,
	game: {
		agent: String,
		map: String,
		rank: String,
	},
});

module.exports = raffleEntrySchema;
