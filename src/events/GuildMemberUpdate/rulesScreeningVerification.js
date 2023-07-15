const { Events } = require('discord.js');

async function removeUnverifiedRole(guildMember) {
	await guildMember.roles.remove('1121882989035528202', `${guildMember.user.username} verified!`);
}

function welcomeMessageGenerator() {
	const welcomeMessagesArray = [
		'What\'s your philosophy when it comes to warm-up?',
		'What\'s one thing that you want to improve in?',
		'What\'s one thing in your gameplay that you are most proud of?',
	];
	return welcomeMessagesArray[Math.floor(Math.random() * welcomeMessagesArray.length)];
}

async function sendWelcomeMessage(guildMember) {
	// #chit-chat
	const channel = await guildMember.guild.channels.cache.get('797229760978747414');

	return await channel.send({
		content: `Welcome ${guildMember}! ${welcomeMessageGenerator()}`,
		allowedMentions: { users: [guildMember.id] },
	});
}

async function reactToMessage(welcomeMessage) {
	const blobComfyWave = await welcomeMessage.guild.emojis.cache.get('1007825867361235074');
	await welcomeMessage.react(blobComfyWave || '👋');
}

module.exports = {
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) {
		if (oldMember.pending && !newMember.pending) {

			if (!newMember.guild.available) { return; }

			await removeUnverifiedRole(newMember);

			const message = await sendWelcomeMessage(newMember);
			await reactToMessage(message);
		}
	},
};
