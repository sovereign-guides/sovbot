const { Events, userMention, hyperlink } = require('discord.js');
const getOriginalRaffleMessage = require('../../utils/raffles/getOriginalRaffleMessage');
const getWinners = require('../../utils/raffles/getWinners');
const convertWinnerArrayToMentions = require('../../utils/raffles/convertWinnerArrayToMentions');
const PastRaffle = require('../../schemas/raffles/past-raffle-schema');


async function isCompletedRaffle(interaction, targetMessage) {
	if (interaction.applicationId !== targetMessage.author.id) {
		return false;
	}

	return PastRaffle.findById(interaction.targetId);
}

async function updateRaffleWinnersDoc(newWinnerArray, raffle) {
	raffle.winners.push(...newWinnerArray);
	return raffle.save();
}


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isMessageContextMenuCommand()) return;
		if (interaction.commandName !== 'Reroll Raffle') return;

		const targetChannel = await interaction.guild.channels.cache.get(interaction.channelId);
		const targetMessage = await getOriginalRaffleMessage(interaction.targetId, targetChannel);

		const raffle = await isCompletedRaffle(interaction, targetMessage);
		if (!raffle) {
			return interaction.reply({
				content: '💥 This message is not a completed raffle message!',
				ephemeral: true,
			});
		}

		const { noOfWinners, entries: oldEntries, winners: oldWinners } = raffle;

		// :^) https://stackoverflow.com/a/55316303/21395224
		const newEntries = oldEntries.filter(({ _id: id1 }) => !oldWinners.some(({ _id: id2 }) => id2 === id1));

		const newWinnerArray = await getWinners(newEntries, interaction.guild, noOfWinners);

		await updateRaffleWinnersDoc(newWinnerArray, raffle);

		const newWinnerMentions = convertWinnerArrayToMentions(newWinnerArray);

		await interaction.reply({
			content: `${userMention(interaction.user.id)} rerolled the giveaway! Congratulations ${newWinnerMentions} ${hyperlink('↗', targetMessage.url)}`,
		});
	},
};
