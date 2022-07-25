module.exports = {
	name: 'messageCreate',
	async execute(message) {
		const threadChannel = await message.client.channels.fetch('989643005470310500');

		if (message.channelId !== threadChannel.id) return;

		const thread = await threadChannel.threads.create({
			startMessage: message,
			name: `${message} - ${message.author.username}`,
			autoArchiveDuration: 60 * 24 * 7,
			rateLimitPerUser: 0,
			reason: `${message.author.tag} submitted feedback.`,
		});

		console.log(`Created thread: ${thread.name}`);
	},
};
