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
		// The Verified role.
		const SovereignSquad = '1136416815686373436';

		const oldRoles = oldMember.roles.cache;
		const newRoles = newMember.roles.cache;

		if (oldRoles.has(SovereignSquad)) return;
		if (!newRoles.has(SovereignSquad)) return;

		await sendWelcomeMessage(newMember)
			.then(async m => await reactToMessage(m));
	},
};
