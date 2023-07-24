const { Client, GatewayIntentBits, Collection, Options } = require('discord.js');
const { globSync } = require('glob');
const { discordToken } = require('./config.json');

const client = new Client({
	intents: [
		// Privileged Intents
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,

		// Normal Intents.
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.AutoModerationExecution,
	],
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		MessageManager: 200,
		GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: member => member.id === client.user.id,
		},
	}),
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 3600,
			lifetime: 1800,
		},
		guildMembers: {
			interval: 3600,
			filter: () => guildMember => guildMember.user.bot && guildMember.user.id !== client.user.id,
		},
	},
});

client.commands = new Collection();
const commandFiles = globSync('src/modules/**/commands/*.js');
for (let file of commandFiles) {
	file = file.replace('src\\', './');
	const command = require(file);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
	}
}

const eventFiles = globSync('src/modules/**/events/*.js');
for (let file of eventFiles) {
	file = file.replace('src\\', './');
	const event = require(file);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(discordToken);
module.exports.SovBot = client;
