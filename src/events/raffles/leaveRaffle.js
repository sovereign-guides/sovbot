const { Events, EmbedBuilder } = require('discord.js');
const UpcomingRaffle = require('../../schemas/raffles/upcoming-raffle-schema');

function isAlreadyInRaffle(userId, entries) {
	return entries.includes(userId);
}

function updateTotal(raffleMessage, updatedRaffleDocument) {
	const regex = new RegExp('Entries: \\*\\*[0-9]\\*\\*+');

	const oldEmbed = raffleMessage.embeds[0];

	const newEntryCount = updatedRaffleDocument.entries.length;
	const newEmbedDescription = oldEmbed.description.replace(regex, `Entries: **${newEntryCount}**`);

	return EmbedBuilder.from(oldEmbed)
		.setDescription(newEmbedDescription);
}

async function leaveRaffle(userId, raffle) {
	raffle.entries.pop(userId);
	return raffle.save();
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) { return; }
		if (interaction.customId !== 'raffle-leave') { return; }

		const raffleMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
		const raffle = await UpcomingRaffle.findById(raffleMessage.id);

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
	},
};
