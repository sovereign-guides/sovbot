const { Events } = require('discord.js');
const mongoose = require('mongoose');
const queryRaffleDatabase = require('../../raffles/utils/queryRaffleDatabase');
const queryPatchDatabase = require('../../postOnPatch/utils/queryPatchDatabase');
const { mongo } = require('../../../config.json');


/**
 * Connect the bot to the specified database.
 * @param database
 * @returns {Promise<void>}
 */
async function connectToMongo(database) {
	const username = encodeURIComponent(mongo.username);
	const password = encodeURIComponent(mongo.password);
	const cluster = mongo.cluster;
	const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

	await mongoose.connect(uri, {
		socketTimeoutMS: 10_000,
		dbName: database,
	})
		.catch(e => console.log(e))
		.then(() => console.log(`MongoDB: Connected to ${database}.`));
}

async function validateClient(client) {
	if (!client.user) {
		console.log('Client could not start.');
		return;
	}

	console.log(`${client.user.tag} (${client.user.id}) is online!`);
}

/**
 * Starts an automatic process to query the database every 60,000 ms.
 * @returns {Promise<void>}
 */
async function scheduleTableQuery() {
	await queryRaffleDatabase();
	await queryPatchDatabase();
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await validateClient(client);
		await connectToMongo('sovbot');
		setInterval(await scheduleTableQuery, 180_000);
	},
};
