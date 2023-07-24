const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Options } = require('discord.js');
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
const modulesPath = path.join(__dirname, 'modules');
const modulesFolders = fs.readdirSync(modulesPath);

for (const module of modulesFolders) {
	const commandsPath = path.join(modulesPath, module, 'commands');
	const commandFiles = fs.readdirSync(commandsPath);

	if (commandFiles.length === 0) {
		continue;
	}

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const module of modulesFolders) {
	const eventsPath = path.join(modulesPath, module, 'events');
	const eventsFiles = fs.readdirSync(eventsPath);
	for (const file of eventsFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

client.login(discordToken);
module.exports.SovBot = client;
