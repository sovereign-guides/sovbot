/**
 * ENUMS for Achievement Types.
 * @type {Readonly<{'1': {description: string, title: string}, '2': {description: string, title: string}, '3': {description: string, title: string}, '4': {description: string, title: string}, '5': {description: string, title: string}, '6': {description: string, title: string}, '7': {description: string, title: string}}>}
 */
const ACHIEVEMENTS = Object.freeze({
	'1': {
		title: '🥇 First 1k Members!',
		description: 'Be one of the first 1000 members.',
	},
	'2': {
		title: '🏅 100k Subs!',
		description: 'A member when Airen crossed 100k subscribers.',
	},
	'3': {
		title: '⌚ A semester of fun!',
		description: 'Be a part of this server for more than 6 months.',
	},
	'4': {
		title: '🎉 Onto another one!',
		description: 'Be a part of this server for over 12 months.',
	},
	'5': {
		title: '🏟️ Season Ticket Holder',
		description: 'Attend at least one of Airen\'s stages.',
	},
	'6': {
		title: '🏆 Event Winner',
		description: 'A winner of at least of one our events.',
	},
	'7': {
		title: '🤖 Beep boop boop beep',
		description: 'Beep Boop Beep Boop Beep Boop Beep.',
	},
});

module.exports = ACHIEVEMENTS;
