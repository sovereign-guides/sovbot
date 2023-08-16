const { Events, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, userMention, inlineCode, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dayjs = require('dayjs');
const PastRaffle = require('../schemas/past-raffle-schema');
const UpcomingRaffle = require('../schemas/upcoming-raffle-schema');
const getWinnerIdFromThread = require('../utils/getWinnerIdFromThread');
const getRaffleMessageIdFromThread = require('../utils/getRaffleMessageIdFromThread');
const isValidDate = require('../utils/isValidDate');
const getRaffleObject = require('../utils/getRaffleObject');
const matchYouTubeLink = require('../../../utils/matchYouTubeLink');


async function joinRaffle(userId, raffle, vodLinkInput, focusInput) {
	raffle.entries.push({ _id: userId, vodLink: vodLinkInput, focus: focusInput });
	return raffle.save();
}

function updateTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('Entries: \\*\\*[0-9]\\*\\*+');

	const oldEmbed = raffleMessage.embeds[0];

	const newEntryCount = updatedRaffleDocument.entries.length;
	const newEmbedDescription = oldEmbed.description.replace(regex, `Entries: **${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
}

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
		channel: '1077681347709108324',
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

		if (interaction.customId === 'modal-raffle-join') {
			const raffleMessage = interaction.message;
			const raffle = await UpcomingRaffle.findById(raffleMessage.id);

			const focusInput = interaction.fields.getTextInputValue('focusInput');
			const vodLinkInput = interaction.fields.getTextInputValue('vodLinkInput');

			const linkValidity = matchYouTubeLink(vodLinkInput);
			if (!linkValidity) {
				return await interaction.reply({
					content: `I'm sorry, I do not believe your VOD link to be a YouTube link. Please upload your VOD to YouTube then resubmit this form. If I am wrong, please contact ${userMention('1032393684378992692')}.`
						+ `\n\n🔎 What is the particular focus? ${inlineCode(focusInput)}`
						+ `\n🔗 The YouTube link to your VOD? ${inlineCode(vodLinkInput)}`,
					ephemeral: true,
				});
			}

			const updatedRaffleDocument = await joinRaffle(interaction.user.id, raffle, vodLinkInput, focusInput);
			const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

			await interaction.update({
				embeds: [updatedRaffleMessageEmbed],
			});
		}

		else if (interaction.customId === 'modal-raffle-set-vod-information') {
			const agentInput = interaction.fields.getTextInputValue('agentInput').toLowerCase();
			const mapInput = interaction.fields.getTextInputValue('mapInput').toLowerCase();
			const rankInput = interaction.fields.getTextInputValue('rankInput').toLowerCase();

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

			const thread = await interaction.guild.channels.cache.get(interaction.channelId);
			const raffleId = getRaffleMessageIdFromThread(thread);
			const winnerId = getWinnerIdFromThread(thread);

			await PastRaffle.findOneAndUpdate(
				{ '_id': raffleId, 'winners._id': winnerId },
				{
					'$set': {
						'winners.$.game.agent': gameAgent,
						'winners.$.game.map': gameMap,
						'winners.$.game.rank': gameRank,
					},
				},
			).catch(e => console.error(e));

			await interaction.reply({
				content: `${toPascalCase(agentInput)}, ${toPascalCase(mapInput)}, ${toPascalCase(rankInput)} all set!`,
			});
		}

		else if (interaction.customId === 'modal-raffle-get-event-start-time') {
			const date = interaction.fields.getTextInputValue('timeInput');

			if (isValidDate(date) === false) {
				return interaction.reply({
					content: 'Please enter a valid date.',
					ephemeral: true,
				});
			}

			await createGuildEvent(interaction, dayjs.unix(date));
		}
	},
};
