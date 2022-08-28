const { channels: { utility: { feedbackChannelId } } } = require('../config.json');

module.exports = {
	name: 'messageReactionAdd',
	async execute(reaction, user) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			}
			catch (error) {
				console.error('Something went wrong when fetching the message:', error);
				return;
			}
		}
		if (reaction.message.channelId !== feedbackChannelId) return;

		// Ignore self
		if (user.id === reaction.client.id) return;

		const feedbackChannel = await reaction.client.channels.cache.get(feedbackChannelId);
		const feedbackThread = feedbackChannel.threads.cache.find(t => t.name === reaction.message.embeds[0].title);

		await feedbackThread.members.add(user);
	},
};
