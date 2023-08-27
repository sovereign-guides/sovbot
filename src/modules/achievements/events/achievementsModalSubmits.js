const { Events, inlineCode } = require('discord.js');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const ACHIEVEMENTS = require('../utils/ACHIEVEMENTS');
const UserAchievement = require('../schemas/user-achievement-schema');

/**
 * Determines whether each Id is a valid Id.
 * @param id
 * @returns {boolean}
 */
function validateAchievementIds(id) {
	const achievementCount = Object.keys(ACHIEVEMENTS).length;

	if (Number(id) < 0) {
		return false;
	}
	else if (Number(id) > achievementCount) {
		return false;
	}
	else if (!Number.isInteger(Number(id))) {
		return false;
	}

	return true;
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		if (interaction.customId.slice(0, 25) !== 'modal-achievements-modify') return;

		const targetId = interaction.customId.slice(26);
		const toAddInputs = interaction.fields.getTextInputValue('add-achievement').split(',');
		const toRemoveInputs = interaction.fields.getTextInputValue('remove-achievement').split(',');

		let attemptedSaveCount = toAddInputs.length;
		let attemptedDeletedCount = toRemoveInputs.length;
		await interaction.reply({
			content: `Attempting to save ${inlineCode(attemptedSaveCount)} achievements...\nAttempting to delete ${inlineCode(attemptedDeletedCount)} achievements...`,
			ephemeral: true,
		});

		let filteredAddIds = [];
		let savedCount = 0;
		if (toAddInputs.some(Boolean)) {
			filteredAddIds = toAddInputs.filter(validateAchievementIds);

			const docs = [];
			for (const id of filteredAddIds) {
				docs.push(new UserAchievement({
					_id: new mongoose.Types.ObjectId(),
					userId: targetId,
					achievementId: id,
					obtained: dayjs(),
				}));
			}

			await UserAchievement.insertMany(docs).then(r => savedCount = r.length);
		}

		let filteredRemoveIds = [];
		let deletedCount = 0;
		if (toRemoveInputs.some(Boolean)) {
			filteredRemoveIds = toRemoveInputs.filter(validateAchievementIds);
			await UserAchievement.deleteMany({
				userId: targetId,
				achievementId: { '$in': filteredRemoveIds },
			}).then(r => deletedCount = r.deletedCount);
		}

		if (toAddInputs[0] === '') { attemptedSaveCount = toAddInputs.length - 1; }
		const savedPercentage = Math.floor(savedCount / attemptedSaveCount) * 100;

		if (toRemoveInputs[0] === '') { attemptedDeletedCount = toRemoveInputs.length - 1; }
		const deletedPercentage = Math.floor(deletedCount / attemptedDeletedCount) * 100;

		await interaction.editReply({
			content: `Saved: ${inlineCode(`${savedCount} / ${attemptedSaveCount} (${savedPercentage}%)`)}\nDeleted: ${inlineCode(`${deletedCount} / ${attemptedDeletedCount} (${deletedPercentage}%)`)}`,
			ephemeral: true,
		});
	},
};
