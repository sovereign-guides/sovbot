const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');


module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('View Achievements')
		.setType(ApplicationCommandType.User),
	execute() {
		// Avoids warning from deploy-commands.
	},
};
