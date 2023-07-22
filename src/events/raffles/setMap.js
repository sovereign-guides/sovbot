const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');


async function getMapResponse(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-set-map')
		.setTitle('Set VOD Map');

	const mapInput = new TextInputBuilder()
		.setCustomId('mapInput')
		.setLabel('Which map? (Include only the name)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(mapInput);

	modal.addComponents(row);
	await interaction.showModal(modal);
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'thread-set-map-button') return;

		await getMapResponse(interaction);
	},
};
