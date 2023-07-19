const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const UpcomingRaffle = require('../../schemas/raffles/upcoming-raffle-schema');

function isAlreadyInRaffle(userId, entries) {
	return entries.includes(userId);
}

async function joinRaffle(userId, raffle) {
	raffle.entries.push(userId);
	return raffle.save();
}

function updateTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('Entries: \\*\\*[0-9]\\*\\*+');

	const oldEmbed = raffleMessage.embeds[0];

	const newEntryCount = updatedRaffleDocument.entries.length;
	const newEmbedDescription = oldEmbed.description.replace(regex, `Entries: **${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) { return; }
		if (interaction.customId !== 'raffle-join') { return; }

		const raffleMessage = interaction.message;
		const raffle = await UpcomingRaffle.findById(raffleMessage.id);

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

		const updatedRaffleDocument = await joinRaffle(interaction.user.id, raffle);
		const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

		await interaction.update({
			embeds: [updatedRaffleMessageEmbed],
		});
	},
};
