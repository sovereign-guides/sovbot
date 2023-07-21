/**
 * Fetches a guildMember from a guilds' MemberManager.
 * @param memberId The Id of the member to be fetched.
 * @param guild The guild object to use when fetching.
 * @returns {Promise<GuildMember>} The fetched member, or, a status indicating that the Id is not in the guild.
 */
module.exports = async function resolveGuildMember(memberId, guild) {
	return await guild.members.fetch(memberId)
		.catch(e => {
			if (e.code === 10017) {
				return false;
			}
		});
};
