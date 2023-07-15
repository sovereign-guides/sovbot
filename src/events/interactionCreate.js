const { Events,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const Raffle = require('../schemas/raffle-schema');

function isAlreadyInRaffle(userId, entries) {
	return entries.includes(userId);
}

async function leaveRaffle(interaction, raffle) {
	raffle.entries.pop(interaction.user.id);
	return raffle.save();
}

async function enterRaffle(interaction, raffle) {
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
					const leaveRaffleButton = new ButtonBuilder()
						.setCustomId('raffle-leave')
						.setLabel('Leave Raffle')
						.setStyle(ButtonStyle.Danger);

					const row = new ActionRowBuilder()
						.addComponents(leaveRaffleButton);

					return await interaction.reply({
						content: 'You have already entered this raffle!',
						components: [row],
						ephemeral: true,
					});
				}

				const updatedRaffleDocument = await enterRaffle(interaction, raffle);
				const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

				await interaction.update({
					embeds: [updatedRaffleMessageEmbed],
				});
			}
			else if (interaction.customId === 'raffle-leave') {
				const raffleMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
				const raffle = await Raffle.findById(raffleMessage.id);

				if (!isAlreadyInRaffle(interaction.user.id, raffle.entries)) {
					return await interaction.update({
						content: '💥 You cannot leave this raffle because you have not joined!',
						components: [],
						ephemeral: true,
					});
				}

				const updatedRaffleDocument = await leaveRaffle(interaction, raffle);
				const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

				await raffleMessage.edit({
					embeds: [updatedRaffleMessageEmbed],
				});

				return await interaction.update({
					content: 'You have successfully left the raffle!',
					components: [],
					ephemeral: true,
				});
			}
		}
	},
};
