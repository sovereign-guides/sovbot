const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleEntrySchema = new Schema({
	_id: String,
	vodLink: String,
	focus: String,
	game: {
		agent: {
			type: String,
			default: '',
		},
		map: {
			type: String,
			default: '',
		},
		rank: {
			type: String,
			default: '',
		},
	},
});

module.exports = raffleEntrySchema;
