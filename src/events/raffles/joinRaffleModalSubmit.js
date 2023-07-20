const { Events,
	EmbedBuilder,
} = require('discord.js');
const UpcomingRaffle = require('../../schemas/raffles/upcoming-raffle-schema');

async function joinRaffle(userId, raffle, vodLinkInput, focusInput) {
	raffle.entries.push({ _id: userId, vodLink: vodLinkInput, focus: focusInput });
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
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId !== 'modal-raffle-join') return;

		const raffleMessage = interaction.message;
		const raffle = await UpcomingRaffle.findById(raffleMessage.id);

		const vodLinkInput = interaction.fields.getTextInputValue('vodLinkInput');
		const focusInput = interaction.fields.getTextInputValue('focusInput');

		const updatedRaffleDocument = await joinRaffle(interaction.user.id, raffle, vodLinkInput, focusInput);
		const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

		await interaction.update({
			embeds: [updatedRaffleMessageEmbed],
		});
	},
};
