const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

module.exports = function validateDate(date) {
	let isValid = true;
	const formattedDate = dayjs.unix(date);

	dayjs.extend(customParseFormat);
	if (dayjs(formattedDate, 'x').isValid() === false) {
		isValid = false;
	}

	const now = dayjs();
	const timeDifference = formattedDate - now;
	if (timeDifference < 0) {
		return false;
	}

	return isValid;
};
