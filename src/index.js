const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const { SovBot } = require('./SovBot');
const { discordToken } = require('./config.json');


SovBot.commands = new Collection();
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
			SovBot.commands.set(command.data.name, command);
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
			SovBot.once(event.name, (...args) => event.execute(...args));
		}
		else {
			SovBot.on(event.name, (...args) => event.execute(...args));
		}
	}
}

SovBot.login(discordToken);
