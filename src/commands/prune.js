const { SlashCommandBuilder,
	PermissionFlagsBits,
	EmbedBuilder,
	Collection,
	ActionRowBuilder,
	ButtonBuilder,
} = require('discord.js');

function filterMap(memberMap) {
	// Technically, everybody on a server always has at least 1 role.
	// Regardless of what their profile says.
	const removeVerified = new Collection(memberMap.filter(m => m.roles.cache.size === 1));

	return removeVerified.filter(m => weekDifferenceCalculator(m));
}

function weekDifferenceCalculator(member) {
	const memberJoinDate = new Date(member.joinedAt);
	const epochTimeDifference = new Date - memberJoinDate;

	const weekTimeDifference = Math.floor(epochTimeDifference / 1000 / 60 / 60 / 24 / 7);
	// Members get three weeks of lee-way.
	return weekTimeDifference >= 0;
}

function commandResponseEmbed(unverifiedMemberMap) {
	return new EmbedBuilder()
		.setColor(0x0eae96)
		.setTitle('😴 Unverified Members')
		.setDescription(`${unverifiedMemberMap.size} Unverified Members`);
}

async function sendCommandResponse(interaction, unverifiedMembersEmbed) {
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('no')
				.setEmoji('🙅')
				// ENUM for the Failure style (red one)
				.setStyle('4'),

			new ButtonBuilder()
				.setCustomId('yes')
				.setEmoji('🫡')
				// ENUM for the Success style (green one)
				.setStyle('3'),
		);

	return await interaction.followUp({
		embeds: [unverifiedMembersEmbed],
		components: [row],
		ephemeral: true,
	});
}

async function pruneTheBitches(unverifiedMemberMap) {
	const dmEmbed = new EmbedBuilder()
		.setColor(0x0eae96)
		.setTitle('Sovereign Guides Server Notice')
		.setDescription('Your account has been removed from the server as you had not verified after 3 weeks of joining.' + '\n' + '\n' +
			'You may reattempt verification at any time by rejoining the server using this link: https://discord.gg/Jb3Kdqwh8Q.' + '\n' + '\n' +
			'If you need more assistance, please see this GIF for more instruction: https://i.imgur.com/TAEgBtg.mp4 or reach out to a member of our staff team by DMing @Sov ModMail (\'Sov ModMail\') at the top of the server\'s member list.',
		);

	let failureCount = 0;

	for (const unverifiedMember of unverifiedMemberMap.values()) {
		await unverifiedMember.send({
			embeds: [dmEmbed],
		})
			.catch(() => failureCount++)
			.then(async () => {
				await unverifiedMember.kick()
					.catch(() => failureCount++);
			});
	}

	return failureCount;
}

function collectUserResponse(interaction, commandResponse, unverifiedMemberMap) {
	const collector = commandResponse.createMessageComponentCollector({
		componentType: 2,
		time: 1000 * 60 * 15,
	});

	collector.on('collect', buttonInteraction => {
		if (buttonInteraction.user.id !== interaction.user.id) {
			return buttonInteraction.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
		}

		collector.stop();
		commandResponse.edit({ components: [] });
	});

	collector.on('end', async collected => {
		if (collected.first() === undefined) {
			return commandResponse.edit({ components: [] });
		}

		const result = collected.first().customId;

		if (result === 'yes') {
			const followUp = interaction.followUp('Commencing prune!! 😈');
			const failureCount = await pruneTheBitches(unverifiedMemberMap);
			return (await followUp).edit(`${failureCount} failures`);
		}

		else {
			return interaction.followUp('Cancelling prune :(');
		}
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Remove unverified members.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();

		await interaction.guild.members.fetch();

		const memberMap = await interaction.guild.channels.cache.get('1014955201926533230').members;

		const unverifiedMemberMap = filterMap(memberMap);

		const unverifiedMembersEmbed = commandResponseEmbed(unverifiedMemberMap);

		const commandResponse = await sendCommandResponse(interaction, unverifiedMembersEmbed);
		collectUserResponse(interaction, commandResponse, unverifiedMemberMap);
	},
};
