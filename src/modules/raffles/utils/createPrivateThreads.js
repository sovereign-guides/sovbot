const { ChannelType, userMention, bold } = require('discord.js');
const resolveGuildMember = require('./resolveGuildMember');
const createPrivateThreadButtons = require('./createPrivateThreadButtons');

module.exports = async function createPrivateThreads(raffle, arrayOfWinners, originalRaffleMessage) {
	const guild = originalRaffleMessage.guild;

	for (const winner of arrayOfWinners) {
		const guildMember = await resolveGuildMember(winner._id, guild);
		if (!guildMember) {
			continue;
		}

		const thread = await originalRaffleMessage.channel.threads.create({
			name: (guildMember.nickname ?? guildMember.user.displayName) + ` (${guildMember.user.id}) ` + ' — ' + raffle._id,
			type: ChannelType.PrivateThread,
			invitable: false,
		});

		const buttonRow = createPrivateThreadButtons();
		await thread.send({
			content: `Congrats ${userMention(guildMember.id)}, you won ${bold(raffle.prize)}! `
				+ 'Now, please follow these next steps using the first two buttons below. After, a server staff will create an event!\n\n'
				+ '1. Enter details surrounding your VOD submitted!.\n'
				+ '2. Schedule your session with Airen using the Calendly link!\n\n'
				+ `🔎 What is the particular focus? ${winner.focus}\n`
				+ `🔗 The YouTube link to your VOD? ${winner.vodLink}`,
			components: [buttonRow],
		}).then(m => m.pin());
	}
};
