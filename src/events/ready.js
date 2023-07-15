const { Events } = require('discord.js');
const mongoose = require('mongoose');
const { mongo } = require('../dev.config.json');

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
		await connectToMongo('raffles');
		validateClient(client);
	},
};
