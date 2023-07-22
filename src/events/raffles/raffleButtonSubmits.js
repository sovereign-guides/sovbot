const { Events,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle, EmbedBuilder,
} = require('discord.js');
const UpcomingRaffle = require('../../schemas/raffles/upcoming-raffle-schema');
const isAlreadyInRaffle = require('../../utils/raffles/isAlreadyInRaffle');


function createJoinRaffleModal() {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-join')
		.setTitle('Free Coaching Information');

	const vodLinkInput = new TextInputBuilder()
		.setCustomId('vodLinkInput')
		.setLabel('🔗 The YouTube link to your VOD?')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('https://youtu.be/dQw4w9WgXcQ')
		.setRequired(true);

	const focusInput = new TextInputBuilder()
		.setCustomId('focusInput')
		.setLabel('🔎 What is the particular focus?')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('When I notice an enemy...')
		.setMinLength(10)
		.setMaxLength(1250)
		.setRequired(true);

	const firstActionRow = new ActionRowBuilder().addComponents(vodLinkInput);
	const secondActionRow = new ActionRowBuilder().addComponents(focusInput);

	modal.addComponents(firstActionRow, secondActionRow);
	return modal;
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
	raffle.entries.pull(userId);
	return raffle.save();
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

		if (interaction.customId === 'button-raffle-join') {
			const raffleMessage = interaction.message;
			const raffle = await UpcomingRaffle.findById(raffleMessage.id);

			if (isAlreadyInRaffle(interaction.user.id, raffle.entries)) {
				const leaveRaffleButton = new ButtonBuilder()
					.setCustomId('button-raffle-leave')
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

			const joinRaffleModal = await createJoinRaffleModal();
			await interaction.showModal(joinRaffleModal);
		}

		if (interaction.customId === 'button-raffle-leave') {
			const raffleMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
			const raffle = await UpcomingRaffle.findById(raffleMessage.id);
			if (!raffle) {
				return await interaction.update({
					content: '💥 This raffle has already ended!',
					components: [],
					ephemeral: true,
				});
			}

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
