const dayjs = require('dayjs');
const handleRaffleEnd = require('../../events/raffles/handleRaffleEnd');


module.exports = async function queryRaffleDatabase(table) {
	const currentDate = dayjs();

	const docs = await table.find({ date: { $lte: currentDate.unix() } });

	if (docs.length === 0) return;

	const raffle = docs[0];
	await handleRaffleEnd(raffle);
};
