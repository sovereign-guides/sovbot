const PastRaffle = require('../schemas/past-raffle-schema');

module.exports = async function getRaffleObject(raffleId) {
	return PastRaffle.findById({ '_id': raffleId });
};
