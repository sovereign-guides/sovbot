/**
 * Matches a given string against RegEx determining if it is a YouTube link.
 * @param link
 * @returns {*}
 */
module.exports = function matchYouTubeLink(link) {
	const regex = new RegExp('(?:youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=)([^#\\&\\?]*)');
	return link.match(regex);
};
