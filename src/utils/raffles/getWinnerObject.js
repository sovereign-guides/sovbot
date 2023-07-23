const PastRaffle = require('../../schemas/raffles/past-raffle-schema');

module.exports = async function getRaffleObject(raffleId) {
	return PastRaffle.findById({ '_id': raffleId });
};
