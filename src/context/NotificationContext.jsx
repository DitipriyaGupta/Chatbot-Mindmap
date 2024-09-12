import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Typography } from "@mui/material";
import { useOrgContext } from "./OrgContext";
import { setupPusher } from "components/common/setupPusher";
import { usePlanContext } from "./PlanContext";
import { PLAN_UNLIMITED } from "components/common/constants";

const NotificationChannelContext = createContext();

/**
 * Hook to access chat configuration context
 * @returns {{
 *  notificationChannel: null,
 * }}
 */
export function useNotificationChannelContext() {
	return useContext(NotificationChannelContext);
}

export function NotificationChannelProvider({ children }) {
	const { org } = useOrgContext();
	const { plan } = usePlanContext();
	const notificationChannel = useRef(null);

	useLayoutEffect(() => {
		if (org.id && plan.live_chat === PLAN_UNLIMITED) {
			setupPusher();
			// TODO: Enable
			// Notification.requestPermission()
			// 	.then((permission) => {
			// 		if (permission === "granted") {
			// 			return true;
			// 		} else {
			// 			return false;
			// 		}
			// 	})
			// 	.catch(console.error);
			notificationChannel.current = window?.Echo?.join?.(
				`org.${org.id}.notification`
			).error((error) => {
				// TODO: Call SaveErrorLog
				console.error(error);
			});
			notificationChannel.current.listen("PushNotification", (data) => {
				// TODO: move to service Worker
				if (
					Notification.permission === "granted" &&
					document.visibilityState === "hidden"
				) {
					new Notification(data.title, {
						body: data.body,
						// actions: [
						// 	{ action: "open-chat", title: "Open Chat", type: "button" },
						// ],
					});
				}
				const url = new URL(data?.link);
				if (url.pathname !== window.location.pathname) {
					toast.info(
						<>
							<Typography variant="subtitle1">{data.title}</Typography>
							<Typography variant="subtitle2">{data.body}</Typography>
							<Button component={Link} to={url.pathname}>
								View
							</Button>
						</>
					);
				}
			});
		}
		return () => {
			notificationChannel.current?.stopListening("PushNotification");
			window?.Echo?.leave?.(`org.${org.id}.notification`);
		};
	}, [org.id, plan.live_chat]);

	return (
		<NotificationChannelContext.Provider
			value={{
				notificationChannel: notificationChannel.current,
			}}
		>
			{children}
		</NotificationChannelContext.Provider>
	);
}
