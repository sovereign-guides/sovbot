const { Events,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
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
		.setRequired(true);

	const firstActionRow = new ActionRowBuilder().addComponents(vodLinkInput);
	const secondActionRow = new ActionRowBuilder().addComponents(focusInput);

	modal.addComponents(firstActionRow, secondActionRow);
	return modal;
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'button-raffle-join') return;

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
	},
};
