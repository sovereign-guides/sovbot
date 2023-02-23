const { Events } = require('discord.js');

function validateClient(client) {
	if (!client.user) {
		console.log('Client could not start.');
		return;
	}

	console.log(`${client.user.tag} (${client.user.id}) is online!`);
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		validateClient(client);
	},
};
