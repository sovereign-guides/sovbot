const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAchievementSchema = new Schema({
	userId: String,
	achievementId: String,
	obtained: Date,
});

const UserAchievement = mongoose.model('User-Achievement', userAchievementSchema);

module.exports = UserAchievement;
