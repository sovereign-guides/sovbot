const { Events, EmbedBuilder, userMention, inlineCode } = require('discord.js');
const UpcomingRaffle = require('../../schemas/raffles/upcoming-raffle-schema');
const matchYouTubeLink = require('../../utils/matchYouTubeLink');


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

		const focusInput = interaction.fields.getTextInputValue('focusInput');
		const vodLinkInput = interaction.fields.getTextInputValue('vodLinkInput');

		const linkValidity = matchYouTubeLink(vodLinkInput);
		if (!linkValidity) {
			return await interaction.reply({
				content: `I'm sorry, I do not believe your VOD link to be a YouTube link. Please upload your VOD to YouTube then resubmit this form. If I am wrong, please contact ${userMention('1032393684378992692')}.`
				+ `\n\n🔎 What is the particular focus? ${inlineCode(focusInput)}`
				+ `\n🔗 The YouTube link to your VOD? ${inlineCode(vodLinkInput)}`,
				ephemeral: true,
			});
		}

		const updatedRaffleDocument = await joinRaffle(interaction.user.id, raffle, vodLinkInput, focusInput);
		const updatedRaffleMessageEmbed = await updateTotal(raffleMessage, updatedRaffleDocument);

		await interaction.update({
			embeds: [updatedRaffleMessageEmbed],
		});
	},
};
