const { Client, GatewayIntentBits } = require('discord.js');

module.exports.SovBot = new Client({
	intents: [
		// Privileged Intents
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,

		// Normal Intents.
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.GuildVoiceStates,
	],
});
