/**
 * Parses guild members' to see whether they are subscribed to Server Subscriptions, returns accordingly what their odds should be.
 * @param guildMemberRoles GuildMembers' roles
 * @returns {Promise<number|string|*|number>} Their odds, respective to their Server Subscription status.
 */
module.exports = async function getPremiumExtraOdds(guildMemberRoles) {
	const premiumRoles = new Map;
	premiumRoles.set('1144933441721348178', { odds: 2 });
	premiumRoles.set('1144933999068852255', { odds: 3 });
	premiumRoles.set('1144934179583316058', { odds: 5 });

	const tier1 = '1144933441721348178';
	const tier2 = '1144933999068852255';
	const tier3 = '1144934179583316058';

	if (guildMemberRoles.has(tier3)) {
		return premiumRoles.get(tier3).odds;
	}

	else if (guildMemberRoles.has(tier2)) {
		return premiumRoles.get(tier2).odds;
	}

	else if (guildMemberRoles.has(tier1)) {
		return premiumRoles.get(tier1).odds;
	}

	else {
		return 1;
	}
};
