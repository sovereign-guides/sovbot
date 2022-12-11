import type { Client } from 'discord.js';
import { Events, ActivityType } from 'discord.js';

function validateClient(client: Client) {
	if (!client.user) {
		console.log('Client could not start.');
		return;
	}

	console.log(`${client.user.tag} (${client.user.id}) is online!`);
}

function memberSizeActivity(client: Client) {
	const sovServer = client.guilds.cache.get('797229760484343838');
	if (!sovServer) {
		return;
	}

	client.user?.setActivity(`with ${sovServer.memberCount} gamers!`, { type: ActivityType.Playing });
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		validateClient(client);
		memberSizeActivity(client);
	},
};
