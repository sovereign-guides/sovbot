const { userMention } = require('discord.js');


/**
 * Destructures an array of winning entry objects to just the appropriate Ids in a mention format.
 * @param arrayOfWinners Entry objects that won.
 * @returns {*[]} An array of plaintext Ids mentions ready to be sent.
 */
module.exports = function convertWinnerArrayToMentions(arrayOfWinners) {
	const mentionsOfWinners = [];
	for (const winner of arrayOfWinners) {
		mentionsOfWinners.push(userMention(winner._id));
	}

	return mentionsOfWinners;
};
