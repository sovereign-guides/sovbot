const dayjs = require('dayjs');
const UpcomingRaffle = require('../../raffles/schemas/upcoming-raffle-schema');
const handleRaffleEnd = require('../events/handleRaffleEnd');


module.exports = async function queryRaffleDatabase() {
	const currentDate = dayjs();

	const docs = await UpcomingRaffle.find({ date: { $lte: currentDate.unix() } });

	if (docs.length === 0) return;

	const raffle = docs[0];
	await handleRaffleEnd(raffle);
};
