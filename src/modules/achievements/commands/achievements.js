const { SlashCommandBuilder, EmbedBuilder, codeBlock, italic } = require('discord.js');
const UserAchievement = require('../schemas/user-achievement-schema');
const ACHIEVEMENTS = require('../utils/ACHIEVEMENTS');

function buildEmbed(user) {
	return new EmbedBuilder()
		.setColor(0x15af98)
		.setAuthor({
			name: user.displayName,
			iconURL: user.avatarURL() ?? user.defaultAvatarURL,
		});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('achievements')
		.setDescription('View your achievements!')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Hide results? (Default false)'),
		)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('View achievements of a specific user.' +
					' (Default you)'),
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const showMessage = interaction.options.getBoolean('ephemeral') ?? false;

		const res = await UserAchievement.find({ userId: user.id });

		const embed = buildEmbed(user);

		if (!res.length) {
			embed.setDescription(italic('You have no achievements yet...'));
			return interaction.reply({
				embeds: [embed],
				ephemeral: showMessage,
			});
		}

		for (const userAchievement of res) {
			const achievement = ACHIEVEMENTS[userAchievement.achievementId.toString()];

			embed.addFields({
				name: achievement.title,
				value: codeBlock(achievement.description),
				inline: true,
			});
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: showMessage,
		});
	},
};
