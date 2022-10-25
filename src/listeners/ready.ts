import type { Client } from 'discord.js';
import { Events } from 'discord.js';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const { tag, id } = client.user!;
		console.log(`${tag} (${id}) is online!`);
	},
};
