const { Events, inlineCode, channelMention, EmbedBuilder, bold } = require('discord.js');

async function messageUser(user) {
	const messageContent = `Hey, your message was blocked in ${channelMention('797229760978747415')} because you do not meet our requirements of being exp level 5. We enforce this rule to prevent abuse.` + '\n' + '\n' +
		'You can increase your level by chatting in the server!' + '\n' +
		`Check your level in ${channelMention('882770860124028970')} with ${inlineCode('g!profile')}.`;

	let messageStatus;
	try {
		await user.send(messageContent)
			.then(() => messageStatus = 0x0eae96);
	}
	catch (e) {
		if (e.code === 50007) {
			messageStatus = 0xce3636;
		}
		else {
			messageStatus = 0xffb02e;
			console.log(e);
		}
	}

	return messageStatus;
}

function createLogEmbed(autoModerationActionExecution, user, messageStatus) {
	return new EmbedBuilder()
		.setTitle('AutoMod: #📸│watch-this Restrictions')
		.setColor(messageStatus)
		.addFields(
			{ name: `${bold('User:')}`, value: `> ${user.tag} (${user})` },
			{ name: `${bold('Message:')}`, value: `> ${autoModerationActionExecution.matchedContent}`, inline: true })
		.setFooter({ text: autoModerationActionExecution.ruleId })
		.setTimestamp();
}

module.exports = {
	name: Events.AutoModerationActionExecution,
	async execute(autoModerationActionExecution) {
		if (autoModerationActionExecution.ruleId !== '1119941908064649316') {
			return;
		}

		if (autoModerationActionExecution.action.type !== 1) {
			return;
		}

		const user = (await autoModerationActionExecution.guild.members.fetch(autoModerationActionExecution.userId)).user;
		const messageStatus = await messageUser(user);

		const logEmbed = createLogEmbed(autoModerationActionExecution, user, messageStatus);
		const logChannel = autoModerationActionExecution.guild.channels.cache.get('988143057767657502');

		return logChannel.send({ embeds: [logEmbed] });
	},
};
