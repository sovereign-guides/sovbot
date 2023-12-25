const { Events } = require('discord.js');

/**
 * Handles members opting in and out of patch notifications.
 * @type {{name: Events.InteractionCreate, execute(*): Promise<void>}}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId !== 'button-toggle-role-988549968073740389') return;

		const role = '988549968073740389';

		if (interaction.member.roles.cache.has(role)) {
			await interaction.member.roles.remove(role);
			await interaction.reply({
				content: 'Role removed! Click again to add.',
				ephemeral: true,
			});
		}
		else {
			await interaction.member.roles.add(role);
			await interaction.reply({
				content: 'Role added! Click again to remove.',
				ephemeral: true,
			});
		}
	},
};
