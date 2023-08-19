/**
 * Extracts the raffle's messageId from a thread's name.
 * @param thread
 * @returns {*}
 */
module.exports = function getRaffleMessageIdFromThread(thread) {
	const regex = new RegExp('\\d{17,20}$');
	return thread.name.match(regex)[0];
};
