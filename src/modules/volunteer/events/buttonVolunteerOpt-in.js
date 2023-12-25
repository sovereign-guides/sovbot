const { Events, channelMention } = require('discord.js');


/**
 * Opts members in and out of the volunteer calling channel.
 * @type {{name: Events.InteractionCreate, execute(*): Promise<void>}}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'button-volunteer-opt') return;

		const volunteerChannel = interaction.guild.channels.cache.get('1188685015626821734');
		const channelPermissions = volunteerChannel.permissionOverwrites;

		if (!channelPermissions.cache.has(interaction.user.id)) {
			await channelPermissions.create(interaction.user, {
				ViewChannel: true,
			});
			await interaction.reply({
				content: `You have been added to ${channelMention('1188685015626821734')}!`,
				ephemeral: true,
			});
		}
		else {
			channelPermissions.delete(interaction.user);
			await interaction.reply({
				content: 'Successfully removed!',
				ephemeral: true,
			});
		}
	},
};
