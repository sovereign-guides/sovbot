const { Events } = require('discord.js');
const axios = require('axios');
const PastRaffle = require('../../schemas/raffles/past-raffle-schema');


async function getAllMaps() {
	const req = await axios.get('https://valorant-api.com/v1/maps')
		.catch(e => console.error(e));
	if (req.status !== 200) {
		return false;
	}

	const allMaps = [];
	for (const map of req.data.data) {
		allMaps.push(map.displayName);
	}

	return allMaps;
}

function getRaffleMessageId(thread) {
	const regex = new RegExp('\\d{17,20}$');
	return thread.name.match(regex)[0];
}

function getWinnerId(thread) {
	const regex = new RegExp('\\((\\d{17,20})\\)');
	return thread.name.match(regex)[1];
}

async function setMapResponse(raffleMessageId, thread, map) {
	const winnerId = getWinnerId(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.map': map,
			},
		},
	).catch(e => console.error(e));
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId !== 'modal-raffle-set-map') return;

		const agentInput = interaction.fields.getTextInputValue('mapInput');
		const allMaps = await getAllMaps();
		if (!allMaps) {
			return interaction.reply('Could not get map.');
		}

		let gameMap = '';
		for (const map of allMaps) {
			if (map.toLowerCase() === agentInput) {
				gameMap = map;
			}
		}

		const thread = interaction.message.channel;
		const raffleMessageId = getRaffleMessageId(thread);
		await setMapResponse(raffleMessageId, thread, gameMap);
		await interaction.reply({
			content: `${gameMap} set as VOD map.`,
			ephemeral: true,
		});
	},
};