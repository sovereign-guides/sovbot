import type { Client } from 'discord.js';
import { Events } from 'discord.js';

function validateClient(client: Client) {
	if (!client.user) {
		console.log('Client could not start.');
		return;
	}

	console.log(`${client.user.tag} (${client.user.id}) is online!`);
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		validateClient(client);
	},
};
