const { Events, EmbedBuilder } = require('discord.js');
const Raffle = require('../schemas/raffle-schema');
const { openDBConnection, closeDBConnection } = require('../utils/database');

function updateEntries(message) {
	const regex = new RegExp('\\*\\*[0-9]\\*\\*+');

	const oldEntryCount = Number(message.match(regex)[0].split('**')[1]);
	const newEntryCount = oldEntryCount + 1;

	return message.replace(regex, `**${newEntryCount}**`);
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isButton()) {
			if (interaction.customId === 'raffle-join') {
				await openDBConnection('raffles');

				const primaryKey = interaction.message.id;

				await Raffle.findByIdAndUpdate(primaryKey, {
					$push: { entries: interaction.user.id },
				}).then(() => closeDBConnection());

				const receivedEmbed = interaction.message.embeds[0];
				let embedDescription = receivedEmbed.description;
				embedDescription = updateEntries(embedDescription);

				const updatedEmbed = EmbedBuilder.from(receivedEmbed)
					.setDescription(embedDescription);

				await interaction.update({
					embeds: [updatedEmbed],
				}).then(() => closeDBConnection());
			}
		}
	},
};
