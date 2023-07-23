const { Events, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');
const axios = require('axios');
const PastRaffle = require('../../schemas/raffles/past-raffle-schema');
const getWinnerIdFromThread = require('../../utils/raffles/getWinnerIdFromThread');
const getRaffleMessageIdFromThread = require('../../utils/raffles/getRaffleMessageIdFromThread');
const validateDate = require('../../utils/raffles/validateDate');
const getRaffleObject = require('../../utils/raffles/getWinnerObject');
const dayjs = require('dayjs');


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

async function setAgentResponse(raffleMessageId, thread, agent) {
	const winnerId = getWinnerIdFromThread(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.agent': agent,
			},
		},
	).catch(e => console.error(e));
}

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

async function setMapResponse(raffleMessageId, thread, map) {
	const winnerId = getWinnerIdFromThread(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.map': map,
			},
		},
	).catch(e => console.error(e));
}

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

async function setRankResponse(raffleMessageId, thread, rank) {
	const winnerId = getWinnerIdFromThread(thread);

	await PastRaffle.findOneAndUpdate(
		{ '_id': raffleMessageId, 'winners._id': winnerId },
		{
			'$set': {
				'winners.$.game.rank': rank,
			},
		},
	).catch(e => console.error(e));
}

async function createGuildEvent(interaction, date) {
	const thread = await interaction.guild.channels.cache.get(interaction.channelId);
	const raffleId = getRaffleMessageIdFromThread(thread);
	const winnerId = getWinnerIdFromThread(thread);

	const raffleObject = await getRaffleObject(raffleId);
	const { prize, description } = raffleObject;

	const winnerObject = raffleObject.winners.filter(winner => winner._id === winnerId)[0];
	const { game: { agent: agent, map: map, rank: rank } } = winnerObject;

	const event = await interaction.guild.scheduledEvents.create({
		name: `${prize}: ${agent} — ${map} — ${rank}`,
		scheduledStartTime: date,
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.StageInstance,
		description: description ?? '',
		channel: '1132164025136980039',
		// TODO
		// channel: '1077681347709108324'
	});

	await interaction.reply({
		content: `Event created!\n${event.url}`,
		ephemeral: true,
	});
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId === 'modal-raffle-set-agent') {
			const agentInput = interaction.fields.getTextInputValue('agentInput').toLowerCase();
			const allAgents = await getAllAgents();
			if (!allAgents) {
				return interaction.reply('Could not get agents.');
			}

			let gameAgent = '';
			for (const agent of allAgents) {
				if (agent.toLowerCase() === agentInput) {
					gameAgent = agent;
				}
			}

			if (gameAgent === '') {
				return interaction.reply({
					content: 'Please enter a valid agent. Make sure you\'re entering only the name!',
					ephemeral: true,
				});
			}

			const thread = interaction.message.channel;
			const raffleMessageId = getRaffleMessageIdFromThread(thread);
			await setAgentResponse(raffleMessageId, thread, gameAgent);
			await interaction.reply({
				content: `${gameAgent} set as VOD agent.`,
				ephemeral: true,
			});
		}

		else if (interaction.customId === 'modal-raffle-set-map') {
			const mapInput = interaction.fields.getTextInputValue('mapInput').toLowerCase();
			const allMaps = await getAllMaps();
			if (!allMaps) {
				return interaction.reply('Could not get maps.');
			}

			let gameMap = '';
			for (const map of allMaps) {
				if (map.toLowerCase() === mapInput) {
					gameMap = map;
				}
			}

			if (gameMap === '') {
				return interaction.reply({
					content: 'Please enter a valid map. Make sure you\'re entering only the name!',
					ephemeral: true,
				});
			}

			const thread = interaction.message.channel;
			const raffleMessageId = getRaffleMessageIdFromThread(thread);
			await setMapResponse(raffleMessageId, thread, gameMap);
			await interaction.reply({
				content: `${gameMap} set as VOD map.`,
				ephemeral: true,
			});
		}

		else if (interaction.customId === 'modal-raffle-set-rank') {
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
			const raffleMessageId = getRaffleMessageIdFromThread(thread);
			await setRankResponse(raffleMessageId, thread, gameRank);
			await interaction.reply({
				content: `${gameRank} set as VOD rank.`,
				ephemeral: true,
			});
		}

		else if (interaction.customId === 'modal-raffle-get-event-start-time') {
			const date = interaction.fields.getTextInputValue('timeInput');

			if (validateDate(date) === false) {
				return interaction.reply({
					content: 'Please enter a valid date.',
					ephemeral: true,
				});
			}

			await createGuildEvent(interaction, dayjs.unix(date));
		}
	},
};
