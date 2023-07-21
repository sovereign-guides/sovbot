const { Events } = require('discord.js');
const axios = require('axios');
const PastRaffle = require('../../schemas/raffles/past-raffle-schema');


async function getAllAgents() {
	const req = await axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
		.catch(e => console.error(e));
	if (req.status !== 200) {
		return false;
	}

	const allAgents = [];
	for (const agent of req.data.data) {
		allAgents.push(agent.displayName);
	}

	return allAgents;
}

function getRaffleMessageId(thread) {
	const regex = new RegExp('\\d{17,20}$');
	return thread.name.match(regex)[0];
}

function getWinnerId(thread) {
	const regex = new RegExp('\\((\\d{17,20})\\)');
	return thread.name.match(regex)[1];
}

async function setAgentResponse(raffleMessageId, thread, agent) {
	const winnerId = getWinnerId(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.agent': agent,
			},
		},
	).catch(e => console.error(e));
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId !== 'modal-raffle-set-agent') return;

		const agentInput = interaction.fields.getTextInputValue('agentInput');
		const allAgents = await getAllAgents();
		if (!allAgents) {
			return interaction.reply('Could not get agent.');
		}

		let gameAgent = '';
		for (const agent of allAgents) {
			if (agent.toLowerCase() === agentInput) {
				gameAgent = agent;
			}
		}

		const thread = interaction.message.channel;
		const raffleMessageId = getRaffleMessageId(thread);
		await setAgentResponse(raffleMessageId, thread, gameAgent);
		await interaction.reply({
			content: `${gameAgent} set as VOD agent.`,
			ephemeral: true,
		});
	},
};