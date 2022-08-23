module.exports = {
	name: 'guildMemberUpdate',
	async execute(oldMember, newMember) {
		if (oldMember.pending === true && newMember.pending !== true) {
			newMember.roles.add('985979444869070898');
		}
	},
};
