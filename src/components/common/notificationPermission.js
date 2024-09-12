import { toast } from "react-toastify";
import { Post } from "./common";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import firebase from "./firebase";
import saveErrorLogs from "./saveErrorLogs";

const notificationPermission = async () => {
	if (!("Notification" in window)) {
		saveErrorLogs("Notification not supported");
		return;
	} else if (Notification.permission === "granted") {
		if ((await isSupported()).valueOf()) {
			try {
				const messaging = getMessaging(firebase);
				const token = await getToken(messaging, {
					vapidKey:
						"BJsxmy26Ebo2n3L57LWluEna1FFOJuTh8bVLT9FcECoL7NHAGUCz-UaA5VTPCbhZkfudH_WQkH6kVJ2Tq7rZPcE",
				});
				if (token !== localStorage.getItem("fcm_token")) {
					Post(1, "store_fcm_token", { fcm_token: token });
					localStorage.setItem("fcm_token", token);
					return true;
				}
			} catch (error) {
				console.error(error);
			}
		}
	} else if (Notification.permission !== "denied")
		return Notification.requestPermission().then(async (res) => {
			try {
				console.log(res);
				if (res === "granted") {
					if ((await isSupported()).valueOf()) {
						const messaging = getMessaging(firebase);
						try {
							const token = await getToken(messaging, {
								vapidKey:
									"BJsxmy26Ebo2n3L57LWluEna1FFOJuTh8bVLT9FcECoL7NHAGUCz-UaA5VTPCbhZkfudH_WQkH6kVJ2Tq7rZPcE",
							});
							// console.log("FCM Token", { token });
							if (!token) window.location.reload();
							Post(1, "store_fcm_token", { fcm_token: token });
							toast.success("Notifications turned ON !");
							return true;
						} catch (error) {
							console.error(error);
							// toast.error("Firebase messaging not supported");
						}
					} else {
						console.log("Firebase messaging not supported");
						toast.error("Firebase messaging not supported");
					}
				} else if (res === "denied") {
					toast.error("Notification Permission denied");
				}
			} catch (error) {
				console.error(error);
			}
		});
};

export default notificationPermission;
