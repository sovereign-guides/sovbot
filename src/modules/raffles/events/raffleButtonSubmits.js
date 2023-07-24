const { Events,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle, EmbedBuilder,
} = require('discord.js');
const UpcomingRaffle = require('../schemas/upcoming-raffle-schema');
const isAlreadyInRaffle = require('../utils/isAlreadyInRaffle');
const getRaffleMessageIdFromThread = require('../utils/getRaffleMessageIdFromThread');
const getWinnerIdFromThread = require('../utils/getWinnerIdFromThread');
const getRaffleObject = require('../utils/getWinnerObject');


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

async function getVODInformationResponse(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-set-vod-information')
		.setTitle('Set VOD Information');

	const agentInput = new TextInputBuilder()
		.setCustomId('agentInput')
		.setLabel('Which agent? (Include only the name)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const mapInput = new TextInputBuilder()
		.setCustomId('mapInput')
		.setLabel('Which map? (Include only the name)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const rankInput = new TextInputBuilder()
		.setCustomId('rankInput')
		.setLabel('Which rank? (Include only the tier: "Gold")')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const firstActionRow = new ActionRowBuilder().addComponents(agentInput);
	const secondActionRow = new ActionRowBuilder().addComponents(mapInput);
	const thirdActionRow = new ActionRowBuilder().addComponents(rankInput);

	modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
	await interaction.showModal(modal);
}

function printVODInformation(agent, map, rank) {
	return `Agent: ${agent}\nMap: ${map}\nRank: ${rank}`;
}

async function gatekeepCreateEventButton(interaction) {
	if (interaction.member.id !== interaction.guild.ownerId) {
		return await interaction.reply({
			content: 'Sorry, this button is not meant for you!',
			ephemeral: true,
		});
	}

	const thread = await interaction.guild.channels.cache.get(interaction.channelId);
	const raffleId = getRaffleMessageIdFromThread(thread);
	const winnerId = getWinnerIdFromThread(thread);

	const raffleObject = await getRaffleObject(raffleId);
	const winningObject = raffleObject.winners.filter(winner => winner._id === winnerId)[0];

	const agent = winningObject.game.agent || '';
	const map = winningObject.game.map || '';
	const rank = winningObject.game.rank || '';

	if (agent === '' || map === '' || rank === '') {
		return await interaction.reply({
			content: 'Please ensure all fields are complete: \n\n' + printVODInformation(agent, map, rank),
			ephemeral: true,
		});
	}

	return false;
}

async function getEventStartTime(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('modal-raffle-get-event-start-time')
		.setTitle('Create Raffle Event');

	const timeInput = new TextInputBuilder()
		.setCustomId('timeInput')
		.setLabel('When should the event start? (Use HammerTime)')
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const row = new ActionRowBuilder()
		.addComponents(timeInput);

	modal.addComponents(row);
	await interaction.showModal(modal);
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

		else if (interaction.customId === 'button-raffle-leave') {
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

		else if (interaction.customId === 'thread-set-vod-information-button') {
			await getVODInformationResponse(interaction);
		}

		else if (interaction.customId === 'thread-create-event-button') {
			const stopSubmit = await gatekeepCreateEventButton(interaction);
			if (!stopSubmit) {
				await getEventStartTime(interaction);
			}
		}
	},
};
