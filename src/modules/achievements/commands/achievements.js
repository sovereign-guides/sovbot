const { SlashCommandBuilder, EmbedBuilder, codeBlock, italic } = require('discord.js');
const UserAchievement = require('../schemas/user-achievement-schema');
const ACHIEVEMENTS = require('../utils/ACHIEVEMENTS');


/**
 * Creates the template embed that achievements will be built onto.
 * @param user
 * @returns {EmbedBuilder}
 */
function buildEmbed(user) {
	return new EmbedBuilder()
		.setColor(0x15af98)
		.setAuthor({
			name: `${user.displayName}'s Achievements`,
			iconURL: user.avatarURL() ?? user.defaultAvatarURL,
		});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('achievements')
		.setDescription('View your achievements!')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Hide results? (Default True)'),
		)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('View achievements of a specific user.' +
					' (Default you)'),
		),
	async execute(interaction) {
		const hideMessageFlag = interaction.options.getBoolean('ephemeral') ?? true;
		const user = interaction.options.getUser('user') ?? interaction.user;

		const res = await UserAchievement.find({ userId: user.id });

		const achievementEmbed = buildEmbed(user);

		if (!res.length) {
			achievementEmbed.setDescription(italic('You have no achievements yet...'));
			return await interaction.reply({
				embeds: [achievementEmbed],
				ephemeral: hideMessageFlag,
			});
		}

		for (const userAchievement of res) {
			const achievement = ACHIEVEMENTS[userAchievement.achievementId];

			achievementEmbed.addFields({
				name: achievement.title,
				value: codeBlock(achievement.description),
				inline: true,
			});
		}

		await interaction.reply({
			embeds: [achievementEmbed],
			ephemeral: hideMessageFlag,
		});
	},
};
