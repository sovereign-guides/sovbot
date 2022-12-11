import type { Client } from 'discord.js';
import { Events, ActivityType } from 'discord.js';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		if (!client.user) {
			return;
		}
		console.log(`${client.user.tag} (${client.user.id}) is online!`);

		const sovServer = await client.guilds.cache.get('797229760484343838');
		if (!sovServer) {
			return;
		}
		await client.user.setActivity(`with ${sovServer.memberCount} gamers!`, { type: ActivityType.Playing });

	},
};
