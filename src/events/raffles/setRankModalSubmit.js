const { Events } = require('discord.js');
const axios = require('axios');
const PastRaffle = require('../../schemas/raffles/past-raffle-schema');


function toPascalCase(text) {
	return text.replace(/(\w)(\w*)/g,
		function(g0, g1, g2) {return g1.toUpperCase() + g2.toLowerCase();});
}

async function getAllRanks() {
	const req = await axios.get('https://valorant-api.com/v1/competitivetiers')
		.catch(e => console.error(e));
	if (req.status !== 200) {
		return false;
	}

	const allRanks = [];

	for (const tier of req.data.data[req.data.data.length - 1].tiers) {
		const rank = toPascalCase(tier.divisionName);
		allRanks.push(toPascalCase(rank));
	}

	return allRanks;
}

function getRaffleMessageId(thread) {
	const regex = new RegExp('\\d{17,20}$');
	return thread.name.match(regex)[0];
}

function getWinnerId(thread) {
	const regex = new RegExp('\\((\\d{17,20})\\)');
	return thread.name.match(regex)[1];
}

async function setRankResponse(raffleMessageId, thread, rank) {
	const winnerId = getWinnerId(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.rank': rank,
			},
		},
	).catch(e => console.error(e));
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId !== 'modal-raffle-set-rank') return;

		const rankInput = interaction.fields.getTextInputValue('rankInput').toLowerCase();
		const allRanks = await getAllRanks();
		if (!allRanks) {
			return interaction.reply('Could not get ranks.');
		}

		let gameRank = '';
		for (const rank of allRanks) {
			if (rank.toLowerCase() === rankInput) {
				gameRank = rank;
			}
		}

		if (gameRank === '') {
			return interaction.reply({
				content: 'Please enter a valid rank. Make sure you\'re entering only the name!',
				ephemeral: true,
			});
		}

		const thread = interaction.message.channel;
		const raffleMessageId = getRaffleMessageId(thread);
		await setRankResponse(raffleMessageId, thread, gameRank);
		await interaction.reply({
			content: `${gameRank} set as VOD rank.`,
			ephemeral: true,
		});
	},
};