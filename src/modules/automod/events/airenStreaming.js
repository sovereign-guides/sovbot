const { Events,
	ActivityType,
	GuildScheduledEventPrivacyLevel,
	GuildScheduledEventEntityType,
} = require('discord.js');
const dayjs = require('dayjs');

/**
 * Creates a guild event with given context from activity.
 * @param guild
 * @param activity
 * @returns {Promise<void>}
 */
async function createEvent(guild, activity) {
	const startDate = dayjs().add(1, 'minute');
	const endDate = dayjs().add(6, 'hour');

	await guild.scheduledEvents.create({
		name: activity.name,
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.External,
		entityMetadata: { location: activity.url },
		description: activity.url,
		scheduledStartTime: startDate,
		scheduledEndTime: endDate,
	});
}


module.exports = {
	name: Events.PresenceUpdate,
	async execute(oldPresence, newPresence) {
		if (newPresence.userId !== newPresence.guild.ownerId) return;

		if (newPresence.activities.length) {
			const activities = newPresence.activities;
			for (const activity of activities) {
				if (activity.type === ActivityType.Streaming) {
					return await createEvent(newPresence.guild, activity);
				}
			}
		}
	},
};
