export default function compareObj(originalObj, newObj) {
	const keys = Object.keys(originalObj);

	const payload = {};

	keys.forEach((el) => {
		const first = originalObj[el];
		const second = newObj[el];
		if (first !== second) {
			let check;
			if (first instanceof Object && !(first instanceof Array))
				check = compareObj(first, second);
			payload[el] = check || second;
		}
	});
	return payload;
}
