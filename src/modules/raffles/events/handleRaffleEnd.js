const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, bold } = require('discord.js');
const PastRaffle = require('../schemas/past-raffle-schema');
const getWinners = require('../utils/getWinners');
const convertWinnerArrayToMentions = require('../utils/convertWinnerArrayToMentions');
const getOriginalRaffleMessage = require('../utils/getOriginalRaffleMessage');
const createPrivateThreads = require('../utils/createPrivateThreads');
const { SovBot } = require('../../../SovBot');

/**
 * Disables raffles' buttons once raffle has finished.
 * @param originalRaffleMessage MessageResolvable of the raffle.
 * @returns {Promise<void>}
 */
async function disableRaffleMessageComponents(originalRaffleMessage) {
	const oldButton = originalRaffleMessage.components[0].components[0];

	const newButton = ButtonBuilder.from(oldButton)
		.setDisabled(true);

	const row = new ActionRowBuilder()
		.addComponents(newButton);

	await originalRaffleMessage.edit({
		components: [row],
	});
}

/**
 * Replaces the text of winners in the old raffle embed with new winners.
 * @param oldEmbedDescription
 * @param mentionsOfWinners
 * @returns {*}
 */
function updateWinnerDescription(oldEmbedDescription, mentionsOfWinners) {
	const regex = new RegExp('Winners: \\*\\*[0-9]\\*\\*+');

	return oldEmbedDescription.replace(regex, `Winners: ${mentionsOfWinners}`);
}

/**
 * Disables buttons and updates winners.
 * @param originalRaffleMessage
 * @param mentionsOfWinners
 * @returns {Promise<void>}
 */
async function editRaffleMessage(originalRaffleMessage, mentionsOfWinners) {
	await disableRaffleMessageComponents(originalRaffleMessage);

	const oldEmbed = originalRaffleMessage.embeds[0];

	const newDescription = updateWinnerDescription(oldEmbed.description, mentionsOfWinners);

	const newEmbed = EmbedBuilder.from(oldEmbed)
		.setDescription(newDescription);

	await originalRaffleMessage.edit({ embeds: [newEmbed] });
}

/**
 * Reposts the raffle document into the "PastRaffles" collection, removes
 * from "Upcoming Raffles" collection.
 * @param oldRaffleDoc
 * @param winners
 * @returns {Promise<void>}
 */
async function migrateRaffleDocument(oldRaffleDoc, winners) {
	const doc = new PastRaffle({
		_id: oldRaffleDoc._id,
		channelId: oldRaffleDoc.channelId,
		prize: oldRaffleDoc.prize,
		description: oldRaffleDoc.description,
		date: oldRaffleDoc.date,
		noOfWinners: oldRaffleDoc.noOfWinners,
		entries: oldRaffleDoc.entries,
		winners: winners,
	});

	await doc.save()
		.catch(console.error)
		.then(await oldRaffleDoc.deleteOne()).catch(console.error);
}

/**
 * Everything to do with when a raffle ends.
 * @param raffle
 * @returns {Promise<void>}
 */
module.exports = async function handleRaffleEnd(raffle) {
	const messageId = raffle._id;
	const { channelId, prize, noOfWinners, entries } = raffle;

	const channel = await SovBot.channels.cache.get(channelId);
	const guild = channel.guild;

	const arrayOfWinners = await getWinners(entries, guild, noOfWinners);

	await migrateRaffleDocument(raffle, arrayOfWinners);

	const mentionsOfWinners = convertWinnerArrayToMentions(arrayOfWinners);

	const originalRaffleMessage = await getOriginalRaffleMessage(messageId, channel)
		.catch(e => console.error(e.code));
	if (!originalRaffleMessage) {
		return console.error('Raffle Deleted!', raffle);
	}

	await editRaffleMessage(originalRaffleMessage, mentionsOfWinners);

	await originalRaffleMessage.reply({
		content: `Congratulations ${mentionsOfWinners}! You won the ${bold(prize)}!`,
	});

	await createPrivateThreads(raffle, arrayOfWinners, originalRaffleMessage);
};
