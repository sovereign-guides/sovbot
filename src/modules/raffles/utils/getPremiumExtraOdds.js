/**
 * Parses guild members' to see whether they are subscribed to Server Subscriptions, returns accordingly what their odds should be.
 * @param guildMemberRoles GuildMembers' roles
 * @returns {Promise<number|string|*|number>} Their odds, respective to their Server Subscription status.
 */
module.exports = async function getPremiumExtraOdds(guildMemberRoles) {
	const premiumRoles = new Map;
	premiumRoles.set('1199125254279282690', { odds: 11 });
	premiumRoles.set('1199125314446561391', { odds: 33 });
	premiumRoles.set('1199124147389866064', { odds: 33 });

	const tier1 = '1199122506083209368';
	const tier2 = '1199124064535580722';
	const tier3 = '1199125254279282690';
	const tier4 = '1199125314446561391';
	const tier5 = '1199124147389866064';

	if (guildMemberRoles.has(tier5)) {
		return premiumRoles.get(tier5).odds;
	}

	else if (guildMemberRoles.has(tier4)) {
		return premiumRoles.get(tier4).odds;
	}

	else if (guildMemberRoles.has(tier3)) {
		return premiumRoles.get(tier3).odds;
	}

	else if (guildMemberRoles.has(tier2)) {
		return 1;
	}

	else if (guildMemberRoles.has(tier1)) {
		return 1;
	}

	else {
		return 1;
	}
};
