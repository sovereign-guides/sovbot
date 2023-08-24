const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { discordToken, clientId, guildId } = require(`./${process.env.config}`);

const commands = [];
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
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST({ version: '10' }).setToken(discordToken);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
