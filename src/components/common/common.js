import axios from "axios";
import baseDomain from "./baseDomain";
import { toast } from "react-toastify";
export const checkAuth = async ({ tries = 1 } = {}) => {
	return new Promise(async (resolve, reject) => {
		if (tries >= 3) reject();
		try {
			const res = await Get(1, "check_auth");
			return resolve(res);
		} catch (error) {
			// console.error(error);
			const refresh_token = localStorage.getItem("refresh_token");
			if (!refresh_token) {
				localStorage.clear();
				reject("User not found");
			}
			const data = new FormData();
			data.append("refresh_token", refresh_token);
			try {
				const response = await Post(0, "dashboardRefreshAccessToken", data);
				localStorage.setItem("access_token", response.data.data.access_token);
				localStorage.setItem("refresh_token", response.data.data.refresh_token);
				try {
					const res = await checkAuth({ tries: tries + 1 });
					resolve(res);
				} catch (error) {
					console.error(error);
					reject(error);
				}
			} catch (error) {
				console.error(error);
				localStorage.clear();
				reject("User not found");
			}
		}
	});
};

// export const detectIsMobile = () => {
// 	const toMatch = [
// 		/Android/i,
// 		/webOS/i,
// 		/iPhone/i,
// 		/iPad/i,
// 		/iPod/i,
// 		/BlackBerry/i,
// 		/Windows Phone/i,
// 	];
// 	return toMatch.some((toMatchItem) => navigator.userAgent.match(toMatchItem));
// };
export const Get = async (auth, url, params = {}, cancelToken) => {
	// let newData = { ...params, request_url: decodeURIComponent(window.location.href)};
	let newData;
	try {
		if (params instanceof FormData) {
			if (params.has("request_url"))
				params.append("request_url", decodeURIComponent(window.location.href));
			if (params.has("host_url"))
				params.append("host_url", localStorage.getItem("host_url"));
			newData = params;
		} else {
			newData = {
				request_url: decodeURIComponent(window.location.href),
				host_url: localStorage.getItem("host_url"),
				...params,
			};
		}
	} catch (e) {
		newData = {
			request_url: decodeURIComponent(window.location.href),
			host_url: localStorage.getItem("host_url"),
			...params,
		};
	}
	return new Promise((resolve, reject) => {
		axios({
			url: `${baseDomain.route}${baseDomain.subRoute}/${url}`,
			method: "GET",
			...(auth
				? {
						headers: {
							Authorization: `Bearer ${localStorage.getItem("access_token")}`,
							Accept: "application/json;charset=UTF-8",
						},
					}
				: {}),
			params: newData,
			...(cancelToken ? { cancelToken } : {}),
		})
			.then((response) => {
				resolve(response);
			})
			.catch(async (e) => {
				try {
					if (
						e?.response?.data?.message === "Unauthenticated." &&
						url !== "check_auth" &&
						url !== "dashboardRefreshAccessToken"
					) {
						await checkAuth();
						return resolve(await Get(auth, url, params, cancelToken));
					}
					console.error(e);
					reject(e);
				} catch (error) {
					console.error(e);
					reject(e);
				}
			});
	});
};

export const Post = async (
	auth,
	url,
	data = {},
	cancelToken,
	{ showProgress = true } = {}
) => {
	if (/localhost/gi.test(window.location.origin) && url === "save_error_log") {
		console.warn("Skipping save_error_log for", window.location.origin);
		return;
	}
	let newData;
	try {
		if (data instanceof FormData) {
			data.append("request_url", decodeURIComponent(window.location.href));
			if (!data.has("host_url"))
				data.append("host_url", localStorage.getItem("host_url"));
			newData = data;
		} else {
			newData = {
				request_url: decodeURIComponent(window.location.href),
				host_url: localStorage.getItem("host_url"),
				...data,
			};
		}
	} catch (e) {
		newData = {
			request_url: decodeURIComponent(window.location.href),
			host_url: localStorage.getItem("host_url"),
			...data,
		};
	}
	// data = {...data, request_url: decodeURIComponent(window.location.href) };
	return new Promise((resolve, reject) => {
		const toastId = showProgress
			? toast.info("Request in Progress", { progress: 50 })
			: null;
		axios({
			url: `${baseDomain.route}${baseDomain.subRoute}/${url}`,
			method: "POST",
			headers: {
				Authorization: auth
					? `Bearer ${localStorage.getItem("access_token")}`
					: undefined,
				Accept: "application/json;charset=UTF-8",
				"X-Socket-ID": window?.Echo?.socketId?.(),
			},

			data: newData,
			...(cancelToken ? { cancelToken } : {}),
		})
			.then((response) => {
				toast.dismiss(toastId);
				resolve(response);
			})
			.catch(async (e) => {
				toast.dismiss(toastId);
				try {
					if (
						e?.response?.data?.message === "Unauthenticated." &&
						url !== "check_auth" &&
						url !== "dashboardRefreshAccessToken"
					) {
						await checkAuth();
						return resolve(await Post(auth, url, data, cancelToken));
					}
					console.error(e);
					reject(e);
				} catch (error) {
					console.error(e);
					reject(e);
				}
			})
			.finally(() => toast.dismiss(toastId));
	});
};
