const { SlashCommandBuilder } = require('discord.js');
const buildAchievementsEmbed = require('../utils/buildAchievementsEmbed');
const getAchievements = require('../utils/getAchievements');

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

		const res = await getAchievements(user);
		const achievementsEmbed = buildAchievementsEmbed(user, res);

		await interaction.reply({
			embeds: [achievementsEmbed],
			ephemeral: hideMessageFlag,
		});
	},
};
