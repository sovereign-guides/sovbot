const { Events } = require('discord.js');


function welcomeMessageGenerator() {
	const welcomeMessagesArray = [
		'What\'s your favorite agent to play and why?',
		'Do you have any specific strategies or play styles that you prefer?',
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
		if (!oldMember.flags.has(2) && newMember.flags.has(2)) {
			if (!newMember.guild.available) return;

			const message = await sendWelcomeMessage(newMember);
			await reactToMessage(message);
		}
	},
};
