const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAchievementDatesSchema = new Schema({
	_id: String,
	lastChecked: Date,
});

const UserAchievementDates = mongoose.model('User-Achievement-Dates', userAchievementDatesSchema);

module.exports = UserAchievementDates;
