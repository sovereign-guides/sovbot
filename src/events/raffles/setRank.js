const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');


async function getRankResponse(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-set-rank')
		.setTitle('Set VOD Agent');

	const rankInput = new TextInputBuilder()
		.setCustomId('rankInput')
		.setLabel('Which rank? (Include only the tier: "Gold")')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(rankInput);

	modal.addComponents(row);
	await interaction.showModal(modal);
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'thread-set-rank-button') return;

		await getRankResponse(interaction);
	},
};
