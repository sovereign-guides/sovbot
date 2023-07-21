/**
 * Checks whether a user is already in a raffle.
 * @param userId The Id of the user to be queried.
 * @param entries The array of entry objects for the raffle.
 * @returns {*} The entry object of the user, or null.
 */
module.exports = function isAlreadyInRaffle(userId, entries) {
	return entries.id(userId);
};
