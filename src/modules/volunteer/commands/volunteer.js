const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle,
	ActionRowBuilder } = require('discord.js');


/**
 * Builds and shows the modal when the volunteer command is used.
 * @type {{data: SlashCommandSubcommandsOnlyBuilder, execute(*): Promise<void>}}
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('volunteer')
		.setDescription('Commands pertaining to enlisting volunteers.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand.setName('info')
				.setDescription('Post an explanation message for what volunteering is.')
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('Location of info message. Defaults to where the command is run from.')
						.addChannelTypes(ChannelType.GuildText)),
		),
	async execute(interaction) {
		const channelId = interaction.options.getChannel('channel')?.id ?? interaction.channelId;

		const modal = new ModalBuilder()
			.setCustomId(`modal-volunteer-info-${channelId}`)
			.setTitle('Volunteering Information');

		const requirementsInput = new TextInputBuilder()
			.setCustomId('modal-volunteer-requirements-input')
			.setLabel('What is volunteering/requirements?')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Volunteering is... Currently I\'m only looking for...');

		const row = new ActionRowBuilder().addComponents(requirementsInput);

		modal.addComponents(row);
		await interaction.showModal(modal);
	},
};
