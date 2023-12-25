const { ThreadAutoArchiveDuration, hyperlink, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { SovBot } = require('../../../SovBot');


/**
 * Creates a new forum post for discussing the patch.
 * @param patch JSON object of patch from Riot.
 * @param oldThreadId ThreadId of the forum post for the last patch.
 * @returns {Promise<ThreadChannel<boolean>>}
 */
async function createPost(patch, oldThreadId) {
	// #val-discussion = 1047249775180927026
	const channel = SovBot.channels.cache.get('1047249775180927026');

	const oldThread = await channel.threads.fetch(oldThreadId);
	await oldThread.setArchived(true);

	return await channel.threads.create({
		name: patch.title,
		message: {
			content: `https://playvalorant.com/en-us${patch.url.url}`,
		},
		appliedTags: ['1047250886772138114'],
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
	});
}

/**
 * Updates the single patch-post document to reflect the new post.
 * @param patchPostDoc Unmodified patch-post document.
 * @param newPost Newly created forum post for the patch.
 * @param patch JSON object of patch from Riot.
 * @returns {Promise<void>}
 */
async function updatePatchDatabase(patchPostDoc, newPost, patch) {
	patchPostDoc.date = patch.date;
	patchPostDoc.threadId = newPost.id;

	await patchPostDoc.save();
}

/**
 * Mentions the relevant role that this patch has been created.
 * @param post Newly created forum post for the patch.
 * @returns {Promise<void>}
 */
async function announcePost(post) {
	// #content = 988509424089956374
	const channel = SovBot.channels.cache.get('988509424089956374');

	const toggleRoleButton = new ButtonBuilder()
		.setCustomId('button-toggle-role-988549968073740389')
		.setLabel('Toggle notifications')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('<:blobclipboard:1029449759422951485>');

	const forumLinkButton = new ButtonBuilder()
		.setLabel('Take me there!')
		.setURL(post.url)
		.setStyle(ButtonStyle.Link);

	const row = new ActionRowBuilder()
		.addComponents(toggleRoleButton, forumLinkButton);

	await channel.send({
		content: `<:blobgamer:1029449772957970432> Hey <@&988549968073740389>, ${post.name} just dropped!\nSee what others think in ${hyperlink(post.name, `<${post.url}>`)}!`,
		components: [row],
	});
}

/**
 * Calls all the required tasks when a new patch has released.
 * @param newPatches JSON object of patch(es) from Riot.
 * @param patchPostDoc Unmodified patch-post document.
 * @returns {Promise<void>}
 */
module.exports = async function handleNewPatch(newPatches, patchPostDoc) {
	for (const patch of newPatches) {
		const newPatchPost = await createPost(patch, patchPostDoc.threadId);
		await updatePatchDatabase(patchPostDoc, newPatchPost, patch);
		await announcePost(newPatchPost);
	}
};
