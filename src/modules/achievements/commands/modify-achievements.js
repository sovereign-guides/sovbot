const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');


module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Modify Achievements')
		.setType(ApplicationCommandType.User)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	execute() {
		// Avoids warning from deploy-commands.
	},
};
