const { Events } = require('discord.js');

const welcomeMessagesArray = [
	'Tell us what your favorite skin line is!',
	'Tell us what team you support!',
	'Tell us which you prefer from Phantom or Vandal!',
];

function welcomeMessageGenerator() {
	return welcomeMessagesArray[Math.floor(Math.random() * welcomeMessagesArray.length)];
}

module.exports = {
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) {
		if (oldMember.pending && !newMember.pending) {

			if (!newMember.guild.available) {
				return;
			}

			const memberRole = newMember.guild.roles.cache.get('985979444869070898');
			await newMember.roles.add(memberRole);

			const channel = await newMember.guild.channels.cache.get('797229760978747414');
			if (!channel || !channel.isTextBased()) {
				return;
			}

			await channel.send({
				content: `Welcome to the server ${newMember}! Want to break the ice? ${welcomeMessageGenerator()}`,
				allowedMentions: { users: [newMember.user.id] },
			})
				.then(async (message) => {
					const blobComfyWave = await message.guild.emojis.cache.get('1007825867361235074');
					await message.react(blobComfyWave || '👋');
				});
		}
	},
};
