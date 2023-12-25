const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');


/**
 * Responds to the modal launched using the volunteer command.
 * @type {{name: Events.InteractionCreate, execute(*): Promise<void>}}
 */
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId.slice(0, 21) !== 'modal-volunteer-info-') return;

		const requirements = interaction.fields.getTextInputValue('modal-volunteer-requirements-input');
		const channelId = interaction.customId.slice(21);

		const button = new ButtonBuilder()
			.setCustomId('button-volunteer-opt')
			.setLabel('Sign me up!')
			.setEmoji('<:blobgamer:1029449772957970432>')
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder().addComponents(button);

		const channel = await interaction.guild.channels.cache.get(channelId);
		await channel.send({
			content: requirements,
			components: [row],
		});

		await interaction.reply({
			content: 'Success!',
			ephemeral: true,
		});
	},
};
