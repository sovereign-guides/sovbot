const SovBot = require('../../index');

async function resolveGuildMember(guild, memberId) {
	return await guild.members.fetch(memberId);
}

function hasIncreasedOdds(guildMember) {
	const premiumRoles = {
		'1077686372518871060': 1,
		'1077688625967403119': 2,
		'1077690600280838245': 4,
	};

	const guildMemberRoles = guildMember.roles.cache;

	if (!guildMemberRoles.hasAny(premiumRoles)) {
		return 0;
	}

	if (guildMemberRoles.has(premiumRoles['1077690600280838245'])) {
		return premiumRoles['1077690600280838245'];
	}

	else if (guildMemberRoles.has(premiumRoles['1077688625967403119'])) {
		return premiumRoles['1077688625967403119'];
	}

	else if (guildMemberRoles.has(premiumRoles['1077686372518871060'])) {
		return premiumRoles['1077686372518871060'];
	}
}

function increaseOdds(memberId, entries, odds) {
	for (let i = 0; i === odds; i++) {
		entries.push(memberId);
	}

	return entries;
}

async function getWinner(noOfWinners, entries, guild) {
	for (const memberId of entries) {
		const guildMember = await resolveGuildMember(guild, memberId);

		const extraOdds = await hasIncreasedOdds(guildMember);

		if (extraOdds === 0) { continue; }

		increaseOdds(memberId, entries, extraOdds);
	}

	return entries[Math.floor(Math.random() * entries.length)];
}

async function getOriginalRaffleMessage(messageId, channel) {
	return channel.messages.fetch(messageId);
}

module.exports.announceRaffleWinner = async function announceRaffleWinner(raffle) {
	const messageId = raffle._id;
	const { channelId, prize, date, noOfWinners, entries } = raffle;

	const channel = await SovBot.SovBot.channels.cache.get(channelId);
	const guild = channel.guild;

	const winner = await getWinner(noOfWinners, entries, guild);

	const originalRaffleMessage = await getOriginalRaffleMessage(messageId, channel);

	await originalRaffleMessage.reply({ content: `${winner} won!` });

	// TODO Step 1: Edit Original Message
	// TODO Step 2: Reply to original message with new winner!
};