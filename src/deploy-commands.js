const { REST, Routes } = require('discord.js');
const { globSync } = require('glob');
const { discordToken, clientId, guildId } = require('./dev.config.json');

const commands = [];
const commandFiles = globSync('./modules/**/commands/*.js');

for (const file of commandFiles) {
	const command = require(`./${file}`);
	commands.push(command.data.toJSON());
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
