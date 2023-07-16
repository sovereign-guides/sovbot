const SovBot = require('../../index');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, bold, userMention } = require('discord.js');

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

async function disableRaffleMessageComponents(raffleMessage) {
	const oldButton = raffleMessage.components[0].components[0];

	const newButton = ButtonBuilder.from(oldButton)
		.setDisabled(true);

	const row = new ActionRowBuilder()
		.addComponents(newButton);

	await raffleMessage.edit({
		components: [row],
	});
}

async function editRaffleMessage(raffleMessage, winner) {
	await disableRaffleMessageComponents(raffleMessage);

	const oldEmbed = raffleMessage.embeds[0];
	const oldDescription = oldEmbed.description;

	const newDescription = oldDescription + '\n' + 'Winners: ' + `${userMention(winner)}`;
	const newEmbed = EmbedBuilder.from(oldEmbed)
		.setDescription(newDescription);

	raffleMessage.edit({ embeds: [newEmbed] });
}

module.exports.announceRaffleWinner = async function announceRaffleWinner(raffle) {
	const messageId = raffle._id;
	const { channelId, prize, date, noOfWinners, entries } = raffle;

	const channel = await SovBot.SovBot.channels.cache.get(channelId);
	const guild = channel.guild;

	const winner = await getWinner(noOfWinners, entries, guild);

	const originalRaffleMessage = await getOriginalRaffleMessage(messageId, channel);

	await editRaffleMessage(originalRaffleMessage, winner);

	await originalRaffleMessage.reply({ content: `Congratulations ${userMention(winner)}! You won the ${prize}!` });
};