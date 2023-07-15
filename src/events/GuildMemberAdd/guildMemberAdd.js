const { Events } = require('discord.js');

async function addUnverifiedRole(guildMember) {
	await guildMember.roles.add('1121882989035528202', `${guildMember.user.username} just joined and is unverified!`);
}

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(guildMember) {
		if (!guildMember.guild.available) { return; }

		await addUnverifiedRole(guildMember);
	},
};
