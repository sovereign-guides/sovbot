module.exports = function matchYouTubeLink(link) {
	const regex = new RegExp('(?:youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=)([^#\\&\\?]*)');
	return link.match(regex);
};
