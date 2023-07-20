const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isMessageContextMenuCommand()) return;
		if (interaction.commandName !== 'Rerolla Raffle') return;

		console.log(interaction);
	},
};
