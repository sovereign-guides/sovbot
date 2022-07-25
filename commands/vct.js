const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vct')
		.setDescription('Launches the YouTube Watch Together activity.'),
	async execute(interaction) {
		if (interaction.member.voice.channelId !== '988512416222564412') {
			return await interaction.reply({
				content: 'You must join <#988512416222564412> for this!',
				ephemeral: true,
			});
		}

		const invite = await interaction.member.voice.channel.createInvite({
			unique: true,
			targetType: 2,
			targetApplication: '880218394199220334',
			reason: `${interaction.member.user.tag} requested to watch VCT.`,
		});

		await interaction.reply(`[Join ${interaction.member.displayName} in watching VCT!](<${invite}>)`);
	},
};
