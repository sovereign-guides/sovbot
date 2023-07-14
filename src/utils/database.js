const mongoose = require('mongoose');
const { mongo } = require('../dev.config.json');

module.exports.openDBConnection = async function openDBConnection(database) {
	const username = encodeURIComponent(mongo.username);
	const password = encodeURIComponent(mongo.password);
	const cluster = mongo.cluster;
	const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

	await mongoose.connect(uri, {
		socketTimeoutMS: 10_000,
		dbName: database,
	}).catch(e => console.log(e));
};

module.exports.closeDBConnection = function closeDBConnection() {
	mongoose.connection.close();
};