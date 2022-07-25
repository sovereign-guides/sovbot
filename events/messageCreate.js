module.exports = {
	name: 'messageCreate',
	async execute(message) {
		const threadChannel = await message.client.channels.fetch('989643005470310500');

		if (message.channelId !== threadChannel.id) return;

		async function lengthCheck() {
			if (!message.content.length > 100) return;

			// compensates for the ` - {message.author.username}` ending
			const threadSignatureLength = 3 + message.author.username.length;

			// purposefully negative so that we index from the end of the string
			const pointOfSlice = 100 - message.content.length - threadSignatureLength;

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
			return `${message.content.slice(0, pointOfSlice)} - ${message.author.username}`;
		}

		const thread = await threadChannel.threads.create({
			startMessage: message,
			name: await lengthCheck(message) || `${message} - ${message.author.username}`,
			autoArchiveDuration: 60 * 24 * 7,
			rateLimitPerUser: 0,
			reason: `${message.author.tag} submitted feedback.`,
		});

		console.log(`Created thread: ${thread.name}`);
	},
};
