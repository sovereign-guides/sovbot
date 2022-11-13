import fs from 'node:fs';
import path from 'node:path';
import { Client, GatewayIntentBits } from 'discord.js';
import { discordToken } from './config.json';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	],
});

const listenerPath = path.join(__dirname, 'listeners');
const listenerFiles = fs.readdirSync(listenerPath);
listenerFiles.forEach(file => {
	const filePath = path.join(listenerPath, file);

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const listener = require(filePath);

	if (listener.once) {
		client.once(listener.name, (...args) => listener.execute(...args));
	}
	else {
		client.on(listener.name, (...args) => listener.execute(...args));
	}
});

client.login(discordToken);
