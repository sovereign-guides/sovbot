/**
 * Fetches the raffle's message object from its channel MessageManager.
 * @param messageId The Message ID of a raffle.
 * @param channel The channel which the raffle is in.
 * @returns {Promise<Message<boolean>>} The raffle's message object.
 */
module.exports = async function getOriginalRaffleMessage(messageId, channel) {
	return channel.messages.fetch(messageId);
};
