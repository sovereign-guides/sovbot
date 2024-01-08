const { Events, channelMention } = require('discord.js');


/**
 * Opts members in and out of the volunteer system.
 * @type {{name: Events.InteractionCreate, execute(*): Promise<void>}}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'button-volunteer-opt') return;

		const volunteerRole = interaction.guild.roles.cache.get('1189396150592225290');

		if (interaction.member.roles.cache.has(volunteerRole.id)) {
			await interaction.member.roles.remove(volunteerRole);
			await interaction.reply({
				content: 'Successfully opted out.',
				ephemeral: true,
			});
		}
		else {
			await interaction.member.roles.add(volunteerRole);
			await interaction.reply({
				content: `Successfully opted in! Airen will post recording times in ${channelMention('1188685015626821734')} and you will meet in ${channelMention('1193988786053460028')}. Press again to opt out.`,
				ephemeral: true,
			});
		}
	},
};
