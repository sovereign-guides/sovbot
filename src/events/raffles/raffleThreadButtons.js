const { Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require('discord.js');
const getRaffleMessageIdFromThread = require('../../utils/raffles/getRaffleMessageIdFromThread');
const getWinnerIdFromThread = require('../../utils/raffles/getWinnerIdFromThread');
const getRaffleObject = require('../../utils/raffles/getWinnerObject');


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

function printVODInformation(agent, map, rank) {
	return `Agent: ${agent}\nMap: ${map}\nRank: ${rank}`;
}

async function gatekeepCreateEventButton(interaction) {
	if (interaction.member.id !== interaction.guild.ownerId) {
		return await interaction.reply({
			content: 'Sorry, this button is not meant for you!',
			ephemeral: true,
		});
	}

	const thread = await interaction.guild.channels.cache.get(interaction.channelId);
	const raffleId = getRaffleMessageIdFromThread(thread);
	const winnerId = getWinnerIdFromThread(thread);

	const raffleObject = await getRaffleObject(raffleId);
	const winningObject = raffleObject.winners.filter(winner => winner._id === winnerId)[0];

	const agent = winningObject.game.agent || '';
	const map = winningObject.game.map || '';
	const rank = winningObject.game.rank || '';

	if (agent === '' || map === '' || rank === '') {
		return await interaction.reply({
			content: 'Please ensure all fields are complete: \n\n' + printVODInformation(agent, map, rank),
			ephemeral: true,
		});
	}
}

async function getEventStartTime(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-get-event-start-time')
		.setTitle('Create Raffle Event');

	const timeInput = new TextInputBuilder()
		.setCustomId('timeInput')
		.setLabel('When should the event start? (Use HammerTime)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(timeInput);

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

		else if (interaction.customId === 'thread-create-event-button') {
			await gatekeepCreateEventButton(interaction);
			await getEventStartTime(interaction);
		}
	},
};
