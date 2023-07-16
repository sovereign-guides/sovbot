const { EmbedBuilder } = require('discord.js');

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

	const newEntryCount = updatedRaffleDocument.entries.length;

	const oldEmbed = raffleMessage.embeds[0];
	const newEmbedDescription = oldEmbed.description.replace(regex, `**${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
};