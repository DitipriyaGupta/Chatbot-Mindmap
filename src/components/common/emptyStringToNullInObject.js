export default function emptyStringToNullInObject(obj) {
	for (let key in obj) {
		if (obj[key] === "") {
			obj[key] = null;
		}
	}
	return obj;
}
