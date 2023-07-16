const { EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const { announceRaffleWinner } = require('../events/raffles/invokeRaffle');

module.exports.isAlreadyInRaffle = function isAlreadyInRaffle(userId, entries) {
	return entries.includes(userId);
};

module.exports.leaveRaffle = async function leaveRaffle(userId, raffle) {
	raffle.entries.pop(userId);
	return raffle.save();
};

module.exports.enterRaffle = async function enterRaffle(userId, raffle) {
	raffle.entries.push(userId);
	return raffle.save();
};

module.exports.updateTotal = function updateTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('\\*\\*[0-9]\\*\\*+');

	const oldEmbed = raffleMessage.embeds[0];

	const newEntryCount = updatedRaffleDocument.entries.length;
	const newEmbedDescription = oldEmbed.description.replace(regex, `**${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
};

module.exports.queryDatabase = async function queryDatabase(table) {
	const currentDate = dayjs();

	const docs = await table.find({ date: { $lte: currentDate.unix() } });

	if (docs.length === 0) { return; }

	const raffle = docs[0];
	await announceRaffleWinner(raffle);
};

