const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('faq')
		.setDescription('Search Sov\'s common questions!')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Phrase to search for')
				.setRequired(true)
				.setAutocomplete(true))
		.addUserOption(option =>
			option.setName('target')
				.setDescription('User to mention')),
};
