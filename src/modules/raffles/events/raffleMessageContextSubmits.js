const { Events, userMention, hyperlink } = require('discord.js');
const handleRaffleEnd = require('./handleRaffleEnd');
const getOriginalRaffleMessage = require('../utils/getOriginalRaffleMessage');
const getWinners = require('../utils/getWinners');
const convertWinnerArrayToMentions = require('../utils/convertWinnerArrayToMentions');
const createPrivateThreads = require('../utils/createPrivateThreads');
const PastRaffle = require('../schemas/past-raffle-schema');
const UpcomingRaffle = require('../schemas/upcoming-raffle-schema');

/**
 * Checks whether the message is a completed raffle, if, return the raffle doc.
 * @param interaction
 * @param targetMessage
 * @returns {Promise<PastRaffle|Boolean>}
 */
async function isCompletedRaffle(interaction, targetMessage) {
	if (interaction.applicationId !== targetMessage.author.id) {
		return false;
	}

	return PastRaffle.findById(interaction.targetId);
}

/**
 * Checks whether the message is an upcoming raffle, if, return the raffle doc.
 * @param interaction
 * @param targetMessage
 * @returns {Promise<UpcomingRaffle|Boolean>}
 */
async function isUpcomingRaffle(interaction, targetMessage) {
	if (interaction.applicationId !== targetMessage.author.id) {
		return false;
	}

	return UpcomingRaffle.findById(interaction.targetId);
}

/**
 * Updates a raffles' winner array when a raffle is rerolled.
 * @param newWinnerArray
 * @param raffle
 * @returns {Promise<PastRaffle>}
 */
async function updateRaffleWinnersDoc(newWinnerArray, raffle) {
	raffle.winners.push(...newWinnerArray);
	return raffle.save();
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isMessageContextMenuCommand()) return;
		if (interaction.commandName === 'Reroll Raffle') {
			const targetChannel = await interaction.guild.channels.cache.get(interaction.channelId);
			const targetMessage = await getOriginalRaffleMessage(interaction.targetId, targetChannel);

			const raffle = await isCompletedRaffle(interaction, targetMessage);
			if (!raffle) {
				return interaction.reply({
					content: '💥 This message is not a completed raffle!',
					ephemeral: true,
				});
			}

			const { noOfWinners, entries: oldEntries, winners: oldWinners } = raffle;

			// Removes past winners from the new raffles entries array.
			// https://stackoverflow.com/a/55316303/21395224
			const newEntries = oldEntries.filter(({ _id: id1 }) => !oldWinners.some(({ _id: id2 }) => id2 === id1));

			const newWinnerArray = await getWinners(newEntries, interaction.guild, noOfWinners);

			await updateRaffleWinnersDoc(newWinnerArray, raffle);

			await createPrivateThreads(raffle, newWinnerArray, targetMessage);

			const newWinnerMentions = convertWinnerArrayToMentions(newWinnerArray);

			await interaction.reply({
				content: `${userMention(interaction.user.id)} rerolled the giveaway! Congratulations ${newWinnerMentions} ${hyperlink('↗', targetMessage.url)}`,
			});
		}

		else if (interaction.commandName === 'End Raffle') {
			const targetChannel = await interaction.guild.channels.cache.get(interaction.channelId);
			const targetMessage = await getOriginalRaffleMessage(interaction.targetId, targetChannel);

			const raffle = await isUpcomingRaffle(interaction, targetMessage);
			if (!raffle) {
				return interaction.reply({
					content: '💥 This message is not an upcoming raffle!',
					ephemeral: true,
				});
			}

			await handleRaffleEnd(raffle);

			await interaction.reply({
				content: 'Raffle ended early!',
				ephemeral: true,
			});
		}
	},
};
