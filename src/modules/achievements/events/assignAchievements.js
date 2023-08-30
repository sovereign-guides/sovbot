const { Events } = require('discord.js');
const dayjs = require('dayjs');
const mongoose = require('mongoose');
const UserAchievement = require('../schemas/user-achievement-schema');
const UserAchievementDates = require('../schemas/user-achievement-dates-schema');
const getAchievements = require('../utils/getAchievements');
const { SovBot } = require('../../../SovBot');

/**
 * Determines which achievements a user should have on their first message.
 * @param member
 * @returns {Promise<*>}
 */
async function firstTimeSetup(member) {
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
			userId: member.user.id,
			achievementId: id,
			obtained: dayjs(),
		}));
	}

	return await UserAchievement.create(docs)
		.then(async () => {
			await new UserAchievementDates({
				_id: member.user.id,
				lastChecked: dayjs(),
			}).save();
		});
}

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
	if (message.webhookId) return;

	const member = message.member;

	const userDateDoc = await UserAchievementDates.findById({ _id: member.user.id });

	if (!userDateDoc) { return await firstTimeSetup(member); }

	if (userDateDoc.lastChecked > dayjs().subtract(24, 'hour')) return;

	const userAchievementDoc = await getAchievements(member.user.id);

	const oldAchievementIds = userAchievementDoc.map(i => { return i.achievementId ;});
	const newAchievementIds = [];

	if (!oldAchievementIds.includes('3')) {
		if (isSixMonths(member)) {
			newAchievementIds.push('3');

			if (isTwelveMonths(member)) {
				newAchievementIds.push('4');
			}
		}
	}

	const docs = [];
	for (const id of newAchievementIds) {
		docs.push(new UserAchievement({
			_id: new mongoose.Types.ObjectId(),
			userId: member.user.id,
			achievementId: id,
			obtained: dayjs(),
		}));
	}

	await UserAchievement.insertMany(docs).then(async () => {
		await UserAchievementDates.findByIdAndUpdate(
			{ _id: member.user.id },
			{ $inc: { '__v' : 1 }, lastChecked: dayjs() },
		);
	});
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
