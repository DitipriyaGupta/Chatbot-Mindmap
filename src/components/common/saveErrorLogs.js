import { Post } from "./common";

export default async function saveErrorLogs(error, additionalData = {}) {
	// Browser Info
	const browserInfo = {
		name: (function () {
			const userAgent = navigator.userAgent;
			if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
			if (userAgent.indexOf("Safari") !== -1) return "Safari";
			if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
			if (userAgent.indexOf("Edge") !== -1) return "Edge";
			if (
				userAgent.indexOf("MSIE") !== -1 ||
				userAgent.indexOf("Trident/") !== -1
			)
				return "Internet Explorer";
			return "Unknown";
		})(),
		version: (function () {
			const userAgent = navigator.userAgent;
			const match = userAgent.match(
				/(Chrome|Safari|Firefox|Edge|MSIE|Trident)\/([\d.]+)/
			);
			return match ? match[2] : "Unknown";
		})(),
	};

	// Operating System
	const os = (function () {
		const userAgent = navigator.userAgent;
		if (userAgent.indexOf("Win") !== -1) return "Windows";
		if (userAgent.indexOf("Mac") !== -1) return "MacOS";
		if (userAgent.indexOf("Linux") !== -1) return "Linux";
		if (userAgent.indexOf("Android") !== -1) return "Android";
		if (userAgent.indexOf("iOS") !== -1) return "iOS";
		// Add more checks for other operating systems as needed
		return "Unknown";
	})();

	// Screen Resolution
	const screenWidth = window?.screen?.width;
	const screenHeight = window?.screen?.height;
	const resolution = screenWidth + "x" + screenHeight;

	// Final Data
	const data = {
		subject: error?.message,
		error_log: JSON.stringify(error?.trace),
		data: {
			browser_info: `${browserInfo.name} ${browserInfo.version}`,
			os,
			resolution,
			user_slug: localStorage.getItem("slug") ?? undefined,
			...additionalData,
		},
		platform: "Dashboard",
	};
	if (window.location.origin === "http://localhost:3000") {
		console.warn("Skipping save_error_log for", window.location.origin, data);
		return;
	}
	Post(1, "save_error_log", data, undefined, { showProgress: false })
		.then(console.log)
		.catch(console.error);
}
