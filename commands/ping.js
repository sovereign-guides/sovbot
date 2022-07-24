const { SlashCommandBuilder, inlineCode } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Reports the websocket latency'),
	async execute(interaction) {
		return await interaction.reply({ content: inlineCode(`${Math.round(interaction.client.ws.ping)}ms`), ephemeral: true });
	},
};
