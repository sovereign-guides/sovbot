const { EmbedBuilder, italic, codeBlock } = require('discord.js');
const ACHIEVEMENTS = require('./ACHIEVEMENTS');

/**
 * Creates the embed that achievements will be built onto.
 * @param user
 * @param res{Array} The result from the db query.
 * @returns {EmbedBuilder}
 */
module.exports = function buildAchievementsEmbed(user, res) {
	const embed = new EmbedBuilder()
		.setColor(0x15af98)
		.setAuthor({
			name: `${user.displayName}'s Achievements`,
			iconURL: user.avatarURL() ?? user.defaultAvatarURL,
		});

	if (!res.length) {
		embed.setDescription(italic('You have no achievements yet...'));
		return embed;
	}

	for (const userAchievement of res) {
		const achievement = ACHIEVEMENTS[userAchievement.achievementId];

		embed.addFields({
			name: achievement.title,
			value: codeBlock(achievement.description),
			inline: true,
		});
	}

	return embed;
};
