import { useOrgContext } from "context/OrgContext";
import baseDomain from "./baseDomain";
import { checkAuth } from "./common";
import { toast } from "react-toastify";
import axios from "axios";

export const useApiCall = () => {
	const orgContext = useOrgContext();
	const Get = async (auth, url, params = {}, cancelToken) => {
		// let newData = { ...params, request_url: decodeURIComponent(window.location.href)};
		let newData;
		try {
			if (params instanceof FormData) {
				if (params.has("request_url"))
					params.append(
						"request_url",
						decodeURIComponent(window.location.href)
					);
				if (params.has("host_url"))
					params.append("host_url", orgContext?.org?.host_url);
				newData = params;
			} else {
				newData = {
					request_url: decodeURIComponent(window.location.href),
					host_url: orgContext?.org?.host_url,
					...params,
				};
			}
		} catch (e) {
			newData = {
				request_url: decodeURIComponent(window.location.href),
				host_url: orgContext?.org?.host_url,
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

	const Post = async (
		auth,
		url,
		data = {},
		cancelToken,
		{ showProgress = true } = {}
	) => {
		if (
			/localhost/gi.test(window.location.origin) &&
			url === "save_error_log"
		) {
			console.warn("Skipping save_error_log for", window.location.origin);
			return;
		}
		let newData;
		try {
			if (data instanceof FormData) {
				data.append("request_url", decodeURIComponent(window.location.href));
				if (!data.has("host_url"))
					data.append("host_url", orgContext?.org?.host_url);
				newData = data;
			} else {
				newData = {
					request_url: decodeURIComponent(window.location.href),
					host_url: orgContext?.org?.host_url,
					...data,
				};
			}
		} catch (e) {
			newData = {
				request_url: decodeURIComponent(window.location.href),
				host_url: orgContext?.org?.host_url,
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
	const trackOnDashboard = async ({ message }) => {
		Post(1, "track_user_dashboard", { message }, undefined, {
			showProgress: false,
		});
	};
	return { Get, Post, trackOnDashboard };
};
