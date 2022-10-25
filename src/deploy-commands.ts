const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, guildId, discordToken } = require('./dev.config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(discordToken);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		// Use this when testing
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		// Use this when globally pushing commands
		// await rest.put(
		// 	Routes.applicationCommands(clientId),
		// 	{ body: commands },
		// );

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
	}
})();
