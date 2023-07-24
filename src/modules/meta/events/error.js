const { Events } = require('discord.js');

module.exports = {
	name: Events.Error,
	once: false,
	async execute(error) {
		console.log(error);
	},
};
