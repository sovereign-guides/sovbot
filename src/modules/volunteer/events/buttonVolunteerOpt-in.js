const { Events, channelMention } = require('discord.js');


/**
 * Creates and deletes ViewChannel permission for given channels.
 * @param interaction Button interaction opting in or out.
 * @param channel Channel to modify permissions for.
 * @returns {Promise<void>}
 */
async function modifyChannelPermissions(interaction, channel) {
	if (!channel.permissionOverwrites.cache.has(interaction.user.id)) {
		await channel.permissionOverwrites.create(interaction.user, { ViewChannel: true });
		await interaction.followUp({
			content: `You have been successfully added to ${channelMention(channel.id)}!`,
			ephemeral: true,
		});
	}
	else {
		channel.permissionOverwrites.delete(interaction.user);
		await interaction.followUp({
			content: 'Successfully opted out!',
			ephemeral: true,
		});
	}

}

/**
 * Opts members in and out of the volunteer calling channel.
 * @type {{name: Events.InteractionCreate, execute(*): Promise<void>}}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'button-volunteer-opt') return;

		const firstReply = await interaction.reply({
			content: 'Opting...',
			ephemeral: true,
		});

		const volunteerCallChannel = interaction.guild.channels.cache.get('1188685015626821734');
		await modifyChannelPermissions(interaction, volunteerCallChannel);

		const volunteerStageChannel = interaction.guild.channels.cache.get('1188987291981582408');
		await modifyChannelPermissions(interaction, volunteerStageChannel);

		await firstReply.delete();
	},
};
