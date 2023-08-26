const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAchievementSchema = new Schema({
	userId: String,
	achievementId: String,
});

const UserAchievement = mongoose.model('User-Achievement', userAchievementSchema);

module.exports = UserAchievement;
