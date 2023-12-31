const UserAchievement = require('../schemas/user-achievement-schema');

/**
 * Fetches user's achievements from the database.
 * @param user
 * @returns {Promise<Array>}
 */
module.exports = async function getUserAchievements(userId) {
	return UserAchievement.find({ userId: userId });
};
