const { Events } = require('discord.js');
const dayjs = require('dayjs');
const UserAchievement = require('../schemas/user-achievement-schema');
const UserAchievementDates = require('../schemas/user-achievement-dates-schema');
const { SovBot } = require('../../../SovBot');
const mongoose = require('mongoose');


/**
 * Determines whether the member joined at least six months in the past.
 * @param member
 * @returns {boolean}
 */
function isSixMonths(member) {
	const now = dayjs();
	const sixMonthsAgo = now.subtract(6, 'month');
	const joined = dayjs(member.joinedTimestamp);

	return sixMonthsAgo > joined;
}

/**
 * Determines whether the member joined at least twelve months in the past.
 * @param member
 * @returns {boolean}
 */
function isTwelveMonths(member) {
	const now = dayjs();
	const twelveMonthsAgo = now.subtract(12, 'month');
	const joined = dayjs(member.joinedTimestamp);

	return twelveMonthsAgo > joined;
}


SovBot.on(Events.MessageCreate, async message => {
	if (message.applicationId) return;

	const member = message.member;
	const user = member.user;

	const doc = await UserAchievementDates.findById({ _id: user.id });

	const lastChecked = doc?.lastChecked ?? 0;

	if (lastChecked < dayjs().subtract(1, 'hour')) {
		const achievementIds = [];

		if (isSixMonths(member)) {
			achievementIds.push('3');

			if (isTwelveMonths(member)) {
				achievementIds.push('4');
			}
		}

		const docs = [];
		for (const id of achievementIds) {
			docs.push(new UserAchievement({
				_id: new mongoose.Types.ObjectId(),
				userId: user.id,
				achievementId: id,
				obtained: dayjs(),
			}));
		}

		return await UserAchievement.insertMany(docs)
			.then(async () => {
				await new UserAchievementDates({
					_id: user.id,
					lastChecked: dayjs(),
				}).save();
			});
	}
});

SovBot.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	// #! General Stage = 1077681347709108324
	if (newState.channelId !== '1077681347709108324') return;

	// #! General Stage = 1077681347709108324
	const stageChannel = newState.guild.channels.cache.get('1077681347709108324');

	// If Airen is in the stage, it's probably an event.
	if (stageChannel.members.has(newState.guild.ownerId)) {
		return UserAchievement.findOneAndUpdate(
			{ userId: newState.id, achievementId: '5' },
			{ $inc: { '__v' : 1 }, obtained: dayjs() },
			{ upsert: true },
		);
	}
});
