const axios = require('axios');
const dayjs = require('dayjs');
const PatchPost = require('../schemas/post-patch-schema');
const handleNewPatch = require('../events/handleNewPatch');

/**
 * Determines whether there are new patch posts, calls handleNewPatch if there are.
 * @returns {Promise<void>}
 */
module.exports = async function queryPatchDatabase() {
	const patchPostDoc = await PatchPost.findOne({});

	const riotReq = await axios.get('https://playvalorant.com/page-data/en-us/page-data.json');
	const riotPosts = riotReq.data.result.data.allContentstackArticles.nodes;

	const newPosts = [];
	for (const post of riotPosts) {
		if (post.article_tags[0]?.machine_name !== 'patch_notes') {
			continue;
		}

		if (dayjs(post.date) <= dayjs(patchPostDoc.date)) {
			break;
		}

		newPosts.push(post);
	}

	if (newPosts.length) {
		// So that posts are created oldest first.
		newPosts.reverse();

		await handleNewPatch(newPosts, patchPostDoc);
	}
};