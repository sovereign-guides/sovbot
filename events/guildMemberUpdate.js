module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {
		if (oldMember.pending === true && newMember.pending !== true) {
			newMember.roles.add('985979444869070898');

			// 💬│general-chat : 797229760978747414
			const generalChat = newMember.guild.channels.cache.get('797229760978747414');
			generalChat.send({
				content: `Welcome to the server ${newMember}! Want to break the ice? Tell us what your favorite skin line is!`,
				allowedMentions: { users: [newMember.user.id] },
			});
		}
	},
};
