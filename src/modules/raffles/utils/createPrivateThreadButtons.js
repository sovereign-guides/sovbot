const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = function createPrivateThreadButtons() {
	const vodInformationButton = new ButtonBuilder()
		.setCustomId('thread-set-vod-information-button')
		.setLabel('Set VOD Information')
		.setStyle(ButtonStyle.Secondary);

	const calendlyButton = new ButtonBuilder()
		.setLabel('Schedule Session')
		.setStyle(ButtonStyle.Link)
		.setURL('https://calendly.com/sovereignguides/free-coaching');

	const createEvent = new ButtonBuilder()
		.setCustomId('thread-create-event-button')
		.setLabel('Create Event!')
		.setEmoji('🎉')
		.setStyle(ButtonStyle.Success);

	return new ActionRowBuilder().addComponents(vodInformationButton, calendlyButton, createEvent);
};
