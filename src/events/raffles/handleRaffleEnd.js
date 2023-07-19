const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, userMention, bold } = require('discord.js');
const SovBot = require('../../index');

async function resolveGuildMember(memberId, guild) {
	return await guild.members.fetch(memberId)
		.catch(e => {
			if (e.code === 10017) {
				return false;
			}
		});
}

async function getPremiumExtraOdds(guildMemberRoles) {
	const premiumRoles = new Map;
	premiumRoles.set('1077686372518871060', { odds: '2' });
	premiumRoles.set('1077688625967403119', { odds: '3' });
	premiumRoles.set('1077690600280838245', { odds: '5' });
	// TODO remove
	premiumRoles.set('1065727708824350792', { odds: '6' });

	// TODO Remove
	const tierZay = '1065727708824350792';

	const tier3 = '1077690600280838245';
	const tier2 = '1077688625967403119';
	const tier1 = '1077686372518871060';

	if (guildMemberRoles.has(tierZay)) {
		return premiumRoles.get(tier1).odds;
	}

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
}

async function getWinners(entries, guild, noOfWinners) {
	let entriesWithOdds = [];

	for await (const memberId of entries) {
		const guildMember = await resolveGuildMember(memberId, guild);
		if (!guildMember) {
			continue;
		}

		const guildMemberRoles = guildMember.roles.cache;
		const extraOdds = await getPremiumExtraOdds(guildMemberRoles);

		for (let i = 0; i < extraOdds; i++) {
			entriesWithOdds.push(memberId);
		}
	}

	const winners = [];
	for (let i = 0; i < noOfWinners; i++) {
		const winner = entriesWithOdds[Math.floor(Math.random() * entriesWithOdds.length)]
			?? '1000927602518798487';
		winners.push(winner);
		entriesWithOdds = entriesWithOdds.filter(entry => entry !== winner);
	}

	return winners;
}

function convertUserIdsToMentions(arrayOfWinners) {
	const mentionsOfWinners = [];
	for (const winner of arrayOfWinners) {
		mentionsOfWinners.push(userMention(winner));
	}

	return mentionsOfWinners;
}

async function getOriginalRaffleMessage(messageId, channel) {
	return channel.messages.fetch(messageId);
}

async function disableRaffleMessageComponents(originalRaffleMessage) {
	const oldButton = originalRaffleMessage.components[0].components[0];

	const newButton = ButtonBuilder.from(oldButton)
		.setDisabled(true);

	const row = new ActionRowBuilder()
		.addComponents(newButton);

	await originalRaffleMessage.edit({
		components: [row],
	});
}

function updateWinners(oldEmbedDescription, mentionsOfWinners) {
	const regex = new RegExp('Winners: \\*\\*[0-9]\\*\\*+');

	return oldEmbedDescription.replace(regex, `Winners: ${mentionsOfWinners}`);
}

async function editRaffleMessage(originalRaffleMessage, mentionsOfWinners) {
	await disableRaffleMessageComponents(originalRaffleMessage);

	const oldEmbed = originalRaffleMessage.embeds[0];

	const newDescription = updateWinners(oldEmbed.description, mentionsOfWinners);

	const newEmbed = EmbedBuilder.from(oldEmbed)
		.setDescription(newDescription);

	await originalRaffleMessage.edit({ embeds: [newEmbed] });
}

module.exports.handleRaffleEnd = async function handleRaffleEnd(raffle) {
	const messageId = raffle._id;
	const { channelId, prize, noOfWinners, entries } = raffle;

	const channel = await SovBot.SovBot.channels.cache.get(channelId);
	const guild = channel.guild;

	const arrayOfWinners = await getWinners(entries, guild, noOfWinners);
	const mentionsOfWinners = convertUserIdsToMentions(arrayOfWinners);

	const originalRaffleMessage = await getOriginalRaffleMessage(messageId, channel);
	await editRaffleMessage(originalRaffleMessage, mentionsOfWinners);

	await originalRaffleMessage.reply({
		content: `Congratulations ${mentionsOfWinners}! You won the ${bold(prize)}!`,
	});
};
