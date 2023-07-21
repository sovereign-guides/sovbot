const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');


async function getAgentResponse(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-set-agent')
		.setTitle('Set VOD Agent');

	const agentInput = new TextInputBuilder()
		.setCustomId('agentInput')
		.setLabel('Which agent were you? (Include only the name)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(agentInput);

	modal.addComponents(row);
	await interaction.showModal(modal);
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'thread-set-agent-button') return;

		await getAgentResponse(interaction);
	},
};
