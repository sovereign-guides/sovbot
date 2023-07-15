const { Events, EmbedBuilder } = require('discord.js');
const Raffle = require('../schemas/raffle-schema');

function isAlreadyInRaffle(userId, entries) {
	return entries.includes(userId);
}

async function updateEntries(interaction, raffle) {
	raffle.entries.push(interaction.user.id);
	return raffle.save();
}

function updateTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('\\*\\*[0-9]\\*\\*+');

	const newEntryCount = updatedRaffleDocument.entries.length;

	const oldEmbed = raffleMessage.embeds[0];
	const newEmbedDescription = oldEmbed.description.replace(regex, `**${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
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
				const raffleMessage = interaction.message;
				const raffle = await Raffle.findById(raffleMessage.id);

				if (isAlreadyInRaffle(interaction.user.id, raffle.entries)) {
					return await interaction.reply({
						content: 'You have already entered this raffle!',
						ephemeral: true,
					});
				}

				const updatedRaffleDocument = await updateEntries(interaction, raffle);
				const updatedRaffleMessage = await updateTotal(raffleMessage, updatedRaffleDocument);

				await interaction.update({
					embeds: [updatedRaffleMessage],
				});
			}
		}
	},
};
