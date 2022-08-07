module.exports = {
	name: 'messageCreate',
	async execute(message) {

		if (message.channelId !== '989643005470310500') return;
		if (message.author.bot === true) return;

		async function lengthCheck() {
			if (!message.content.length > 100) return;

			// purposefully negative so that we index from the end of the string
			const pointOfSlice = 100 - message.content.length;

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
			return `${message.content.slice(0, pointOfSlice)}`;
		}

		const thread = await message.channel.threads.create({
			startMessage: message,
			name: await lengthCheck(message) || `${message}`,
			autoArchiveDuration: 60 * 24 * 3,
			rateLimitPerUser: 0,
			reason: `${message.author.tag} submitted feedback.`,
		});

		console.log(`Feedback: ${thread.name} by ${message.author.tag}`);
	},
};
