const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

/**
 * Determines whether an inputted timestamp is valid.
 * @param date
 * @returns {boolean}
 */
module.exports = function isValidDate(date) {
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
