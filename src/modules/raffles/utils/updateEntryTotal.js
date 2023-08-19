const { EmbedBuilder } = require('discord.js');

/**
 * Updates the total number of entries in the raffles' embed descriptions.
 * @param raffleMessage
 * @param updatedRaffleDocument
 * @returns {EmbedBuilder}
 */
module.exports = function updateEntryTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('Entries: \\*\\*[0-9]\\*\\*+');

	const oldEmbed = raffleMessage.embeds[0];

	const newEntryCount = updatedRaffleDocument.entries.length;
	const newEmbedDescription = oldEmbed.description.replace(regex, `Entries: **${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
};