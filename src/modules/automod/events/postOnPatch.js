const { Events, hyperlink } = require('discord.js');

/**
 * Matches embed descriptions against a regex determining if the post is
 * about patch notes.
 * @param patchDescription The description of the embed.
 * @returns {*}
 */
function isPatchNotes(patchDescription) {
	const regExp = new RegExp('Patch\\sNotes\\s([+-]?(?=\\.\\d|\\d)(?:\\d+)?\\.?\\d*)');
	return patchDescription?.match(regExp);
}

/**
 * Creates a new forum discussion post around the embed.
 * @param message The incoming message attached to the embed.
 * @param title The patch version.
 * @param body The patch description.
 * @returns {Promise<void>}
 */
async function createForumPost(message, title, body) {
	// #val-discussion = 1047249775180927026
	const channel = message.guild?.channels.cache.get('1047249775180927026');
	if (!channel || channel?.type !== 15) {
		return;
	}

	await channel.threads.create({
		name: title,
		message: { content: body },
		appliedTags: ['1047250886772138114'],

		// ThreadAutoArchiveDuration wasn't being exported,
		// this is the ENUM for 1 week.
		autoArchiveDuration: 10080,
	}).then(async (post) => {
		await message.reply(`Come and discuss this in ${hyperlink(post.name, post.url)}!`);
	});
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		// #content = 988509424089956374
		if (message.channelId !== '988509424089956374') {
			return;
		}

		if (message.webhookId !== '988509810448273440') {
			return;
		}

		await message.fetch(true);

		if (message.embeds[0]?.author?.name !== 'VALORANT (@VALORANT)') {
			return;
		}

		if (!message.embeds[0]?.description) {
			return;
		}

		const patchDescription = message.embeds[0].description;

		const patchNotesMatch = isPatchNotes(patchDescription);
		if (!patchNotesMatch || !patchNotesMatch[0]) {
			return;
		}

		const patchVersion = patchNotesMatch[0];

		await createForumPost(message, patchVersion, patchDescription);
	},
};
