const { Events } = require('discord.js');
const mongoose = require('mongoose');
const Raffle = require('../../raffles/schemas/upcoming-raffle-schema');
const queryRaffleDatabase = require('../../raffles/utils/queryRaffleDatabase');
const { mongo } = require('../../../config.json');

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

async function scheduleTableQuery(table) {
	// ToDo Adjust 10000 -> 60_000
	setInterval(await queryRaffleDatabase, 10_000, table);
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await connectToMongo('raffles');
		await validateClient(client);
		await scheduleTableQuery(Raffle);
	},
};
