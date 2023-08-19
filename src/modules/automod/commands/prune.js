const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Removes active members from the collection of members to kick.
 * @param members
 * @returns {*}
 */
function sweepCollection(members) {
	const SovereignSquadRole = '1141879901432074301';

	members.sweep(member => member.user.bot === true);
	members.sweep(member => member.roles.cache.has(SovereignSquadRole));
	members.sweep(member => {
		const dateDifference = Date.now() - member.joinedTimestamp;
		const twoWeeksUnix = 1209600;

		// We want to remove users who have not been in the server for more than two weeks.
		return dateDifference < twoWeeksUnix;
	});

	return members;
}

/**
 * DMs members why they have been removed.
 * @param members
 */
async function notifyMembers(members) {
	for await (const member of members.values()) {
		member.send('# ⚠️ Sovereign Guides Server Notice\n'
			+ 'Your account has been removed from the server as you had not verified after 2 weeks of joining.\n\n'
			+ 'You may reattempt verification at any time by rejoining the server using this link: https://discord.gg/Jb3Kdqwh8Q\n\n'
			+ 'If you need more assistance, please see this GIF for more instruction: <https://i.imgur.com/TAEgBtg.mp4> or reach out to a member of our staff team by DMing @Sov ModMail (\'Sov ModMail\') at the top of the server\'s member list.',
		).catch(e => console.log(e));
	}
}

/**
 * Kicks members from the server.
 * @param members
 * @returns {Promise<number>}
 */
async function kickMembers(members) {
	let kickCounter = 0;

	for await (const member of members.values()) {
		await member.kick('Pruned.').then(() => kickCounter++);
	}

	return kickCounter;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Removes old members who haven\'t completed Rules Screening.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();

		let members = await interaction.guild.members.fetch();
		members = sweepCollection(members);

		await notifyMembers(members);
		const prunedTotal = await kickMembers(members);

		return interaction.followUp(`Pruned ${prunedTotal} members.`);
	},
};
