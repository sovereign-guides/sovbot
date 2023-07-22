const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');


async function getAgentResponse(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-set-agent')
		.setTitle('Set VOD Agent');

	const agentInput = new TextInputBuilder()
		.setCustomId('agentInput')
		.setLabel('Which agent? (Include only the name)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(agentInput);

	modal.addComponents(row);
	await interaction.showModal(modal);
}

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

		if (interaction.customId === 'thread-set-agent-button') {
			await getAgentResponse(interaction);
		}

		else if (interaction.customId === 'thread-set-map-button') {
			await getMapResponse(interaction);
		}

		else if (interaction.customId === 'thread-set-rank-button') {
			await getRankResponse(interaction);
		}
	},
};
