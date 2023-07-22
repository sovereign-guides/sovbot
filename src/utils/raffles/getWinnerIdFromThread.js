module.exports = function getWinnerIdFromThread(thread) {
	const regex = new RegExp('\\((\\d{17,20})\\)');
	return thread.name.match(regex)[1];
};
