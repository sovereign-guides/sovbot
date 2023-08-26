const { Events, ModalBuilder, TextInputBuilder, TextInputStyle,
	ActionRowBuilder,
} = require('discord.js');
const getAchievements = require('../utils/getAchievements');
const buildAchievementsEmbed = require('../utils/buildAchievementsEmbed');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isUserContextMenuCommand()) return;
		if (interaction.commandName === 'View Achievements') {
			const user = interaction.user;

			const res = await getAchievements(user);
			const achievementsEmbed = buildAchievementsEmbed(user, res);

			return await interaction.reply({
				embeds: [achievementsEmbed],
				ephemeral: true,
			});
		}
		else if (interaction.commandName === 'Modify Achievements') {
			const modal = new ModalBuilder()
				.setCustomId('modal-achievements-modify')
				.setTitle('Modify Achievements');

			const addInput = new TextInputBuilder()
				.setCustomId('add-achievement')
				.setLabel('Achievements to add? (Comma delimited Ids)')
				.setStyle(TextInputStyle.Short)
				.setRequired(false);

			const removeInput = new TextInputBuilder()
				.setCustomId('remove-achievement')
				.setLabel('Achievements to remove? (Comma delimited Ids)')
				.setStyle(TextInputStyle.Short)
				.setRequired(false);

			const firstActionRow = new ActionRowBuilder().addComponents(addInput);
			const secondActionRow = new ActionRowBuilder().addComponents(removeInput);

			modal.addComponents(firstActionRow, secondActionRow);

			return interaction.showModal(modal);
		}
	},
};
