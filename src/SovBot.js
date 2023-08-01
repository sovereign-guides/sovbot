const { Client, GatewayIntentBits, Partials } = require('discord.js');

module.exports.SovBot = new Client({
	intents: [
		// Privileged Intents
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,

		// Normal Intents.
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.AutoModerationExecution,
	],
	partials: [
		Partials.GuildMember,
	],
});
