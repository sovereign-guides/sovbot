const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { feedbackChannelId } = require('../config.json');

module.exports = {
	name: 'messageCreate',
	async execute(message) {

		if (message.channelId !== feedbackChannelId) return;

		// Returns if new message is the bot's form message
		if (message.embeds[0]?.title === 'Server Feedback') return;

		const feedbackEmbed = new EmbedBuilder()
			.setColor(0x2f3136)
			.setTitle('Server Feedback')
			.setDescription('Here you can find a list of all user submitted feedback.\nUpvote a suggestion to automatically join its thread!')
			.addFields({
				name: 'Before submitting feedback',
				value: '`>` Please look and see if your idea has already been discussed!',
			});

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('feedback-button')
					.setLabel('Give feedback')
					.setStyle(1),
			);

		await wait(500);

		await message.channel.send({
			embeds: [feedbackEmbed],
			components: [row],
		});
	},
};
