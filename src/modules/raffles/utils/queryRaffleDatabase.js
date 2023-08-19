const dayjs = require('dayjs');
const UpcomingRaffle = require('../../raffles/schemas/upcoming-raffle-schema');
const handleRaffleEnd = require('../events/handleRaffleEnd');

/**
 * Checks if there are any finished raffles, if, begin the finishing process.
 * @returns {Promise<void>}
 */
module.exports = async function queryRaffleDatabase() {
	const currentDate = dayjs();

	const docs = await UpcomingRaffle.find({ date: { $lte: currentDate.unix() } });

	if (docs.length === 0) return;

	const raffle = docs[0];
	await handleRaffleEnd(raffle);
};
