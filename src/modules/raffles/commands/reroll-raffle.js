const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Reroll Raffle')
		.setType(ApplicationCommandType.Message)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
	execute() {
		// Avoids warning from deploy-commands.
	},
};
