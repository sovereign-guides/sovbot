/**
 * Parses guild members' to see whether they are subscribed to Server Subscriptions, returns accordingly what their odds should be.
 * @param guildMemberRoles GuildMembers' roles
 * @returns {Promise<number|string|*|number>} Their odds, respective to their Server Subscription status.
 */
module.exports = async function getPremiumExtraOdds(guildMemberRoles) {
	const premiumRoles = new Map;
	premiumRoles.set('1199122506083209368', { odds: 2 });
	premiumRoles.set('1199124064535580722', { odds: 3 });
	premiumRoles.set('1199125254279282690', { odds: 5 });

	const tier1 = '1199122506083209368';
	const tier2 = '1199124064535580722';
	const tier3 = '1199125254279282690';

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
