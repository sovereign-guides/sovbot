const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, time, EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const mongoose = require('mongoose');
const Raffle = require('../schemas/raffle-schema');
const { mongo } = require('../dev.config.json');

function validateDate(date) {
	let isValid = true;
	const formattedDate = dayjs.unix(date);

	dayjs.extend(customParseFormat);
	if (dayjs(formattedDate, 'x').isValid() === false) {
		isValid = false;
	}

	const now = dayjs();
	const timeDifference = formattedDate - now;
	if (timeDifference < 0) {
		return false;
	}

	return isValid;
}

function createEmbed(prize, description, date, author) {
	if (description) {
		description = description + '\n' + '\n';
	}
	else {
		description = '';
	}

	return new EmbedBuilder()
		.setColor(0x15af98)
		.setTitle(`:confetti_ball: ${prize}`)
		.setDescription(
			`${description}Ends: ${time(date, 'R')} (${time(date, 'F')})
Hosted by: ${author}
Entries: **0**`,
		)
		.setTimestamp();
}

async function saveRaffle(raffleMessage, prize, date, noOfWinners) {
	const doc = new Raffle({
		_id: raffleMessage.id,
		channelId:  raffleMessage.channelId,
		prize: prize,
		date: date,
		noOfWinners: noOfWinners,
		entries: [],
	});

	const username = encodeURIComponent(mongo.username);
	const password = encodeURIComponent(mongo.password);
	const cluster = mongo.cluster;
	const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

	await mongoose.connect(uri, {
		socketTimeoutMS: 10_000,
	});

	await doc.save()
		.then(() => mongoose.connection.close());
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raffle')
		.setDescription('Manage all things raffle.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand.setName('start')
				.setDescription('Launch a raffle!')
				.addStringOption(option =>
					option.setName('prize')
						.setDescription('What is being won?')
						.setRequired(true),
				)
				.addNumberOption(option =>
					option.setName('date')
						.setDescription('When should this raffle end? (Use HammerTime)')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('description')
						.setDescription('A long form piece around this prize.'),
				)
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('Where is this raffle being held? (Defaults to #raffles-entry)')
						.addChannelTypes(ChannelType.GuildText),
				)
				.addNumberOption(option =>
					option.setName('winner-count')
						.setDescription('How many winners should there be? (Defaults to 1)'),
				),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'start') {
			const prize = interaction.options.getString('prize');
			const description = interaction.options?.getString('description') || null;
			const date = interaction.options.getNumber('date');
			const channel = interaction.options?.getChannel('channel')
				// TODO
				// || await interaction.options.guild.channels.cache.get('1112540056528375913');
				|| await interaction.guild.channels.cache.get('1126970529224597544');
			const noOfWinners = interaction.options?.getNumber('winner-count') || 1;
			const author = interaction.user;

			if (validateDate(date) === false) {
				return interaction.reply('Please enter a valid date.');
			}

			const raffleEmbed = createEmbed(prize, description, date, author);

			const raffleMessage = await channel.send({
				embeds: [raffleEmbed],
			});

			await saveRaffle(raffleMessage, prize, date, noOfWinners);

			return interaction.reply(`Raffle started: ${raffleMessage.url}`);
		}
	},
};
