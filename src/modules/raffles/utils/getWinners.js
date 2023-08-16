const resolveGuildMember = require('./resolveGuildMember');
const getPremiumExtraOdds = require('./getPremiumExtraOdds');


/**
 * Loops through all entry objects and selects noOfWinners (n) winners.
 * @param entries All entry objects of a raffle.
 * @param guild The related guild object that the raffle is hosted in.
 * @param noOfWinners (n) How many winners should be picked.
 * @returns {Promise<*[]>} Winning entry objects.
 */
module.exports = async function getWinners(entries, guild, noOfWinners) {
	let entriesWithOdds = [];

	for await (const entry of entries) {
		const memberId = entry._id;

		const guildMember = await resolveGuildMember(memberId, guild);
		if (!guildMember) {
			continue;
		}

		const guildMemberRoles = guildMember.roles.cache;
		const extraOdds = await getPremiumExtraOdds(guildMemberRoles);

		for (let i = 0; i < extraOdds; i++) {
			entriesWithOdds.push(entry);
		}
	}

	const winners = [];
	for (let i = 0; i < noOfWinners; i++) {
		const winner = entriesWithOdds[Math.floor(Math.random() * entriesWithOdds.length)]
			// @SovBot = 1000927602518798487
			?? { _id: '1000927602518798487' };
		winners.push(winner);
		entriesWithOdds = entriesWithOdds.filter(entry => entry !== winner);
	}

	return winners;
};
