module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {
		if (oldMember.pending === true && newMember.pending !== true) {

			// @Member: 985979444869070898
			await newMember.roles.add('985979444869070898');

			// #💬│general-chat: 797229760978747414
			const generalChat = newMember.guild.channels.cache.get('797229760978747414');

			const welcomeMessagesArray = [
				'Tell us what your favorite skin line is!',
				'Tell us what team you support!',
				'Tell us who your favorite pro-player is!',
				'Tell us what video you came from!',
				'Tell us what your favorite gun is!',
				'Tell us which you prefer from Phantom or Vandal!',
			];

			const welcomeMessage = welcomeMessagesArray[Math.floor(Math.random() * welcomeMessagesArray.length)];

			await generalChat.send({
				content: `Welcome to the server ${newMember}! Want to break the ice? ${welcomeMessage}`,
				allowedMentions: { users: [newMember.user.id] },
			});
		}
	},
};
