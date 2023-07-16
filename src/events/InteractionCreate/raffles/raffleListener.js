const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { isAlreadyInRaffle, enterRaffle, updateTotal, leaveRaffle } = require('./utils/raffle-utils');
const Raffle = require('../../../schemas/raffle-schema');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) {return; }
		if (interaction.customId.slice(0, 6) !== 'raffle') { return;}

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

			const updatedRaffleDocument = await enterRaffle(interaction.user.id, raffle);
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

			const updatedRaffleDocument = await leaveRaffle(interaction.user.id, raffle);
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
	},
};
