const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vct')
		.setDescription('Launches the YouTube Watch Together activity.'),
	async execute(interaction) {
		const theatreChannel = await interaction.client.channels.fetch('932240564102000710');

		const invite = await theatreChannel.createInvite({
			unique: true,
			targetType: 2,
			targetApplication: '880218394199220334',
			reason: `${interaction.member.user.tag} requested to watch VCT.`,
		});

		await interaction.reply(`[Join ${interaction.member.displayName} in watching VCT!](<${invite}>)`);
	},
};
