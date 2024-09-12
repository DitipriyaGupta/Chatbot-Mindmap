import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import styles from "./ChatUser.module.css";
import classNames from "classnames";
import { intlFormatDistance } from "date-fns";
import getBrowser from "components/common/getBrowser";
import getOS from "components/common/getOS";
import getDevice from "components/common/getDevice";
import { usePlanContext } from "context/PlanContext";
import { PLAN_UNLIMITED } from "components/common/constants";
import { useUserContext } from "context/UserContext";
import { useResponsiveContext } from "context/ResponsiveContext";

const ChatUser = ({ user, index, totalChats }) => {
	const {
		creator: { name, email, os, device, browser, country, city, phone },
		id: chatId,
		updated_at: updatedAt,
	} = user;
	const { plan } = usePlanContext();
	const { isMobile } = useResponsiveContext();
	const {
		user: { is_god },
	} = useUserContext();
	const { org, chatId: currentChatId } = useParams();
	const history = useHistory();
	async function handleChatClicked() {
		const url = new URL(window.location.href);
		url.searchParams.set("page", 1);
		if (url.searchParams.has("show_answer_source")) {
			url.searchParams.delete("show_answer_source");
		}
		// if (url.searchParams.has("show_user_details")) {
		// 	url.searchParams.delete("show_user_details");
		// }

		history.push(`/${org}/${chatId}${url.search}`);
	}

	const browserIcon = useMemo(() => getBrowser(browser), [browser]);
	const osIcon = useMemo(() => getOS(os), [os]);
	const deviceIcon = useMemo(() => getDevice(device), [device]);

	const validEmail = email
		?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
		?.pop();

	useEffect(() => {
		if (index === 0 && !currentChatId && !isMobile) {
			handleChatClicked();
		}
	}, []);

	return (
		<div
			className={classNames(styles.highlighter, {
				"blurred-row":
					plan.chats !== PLAN_UNLIMITED &&
					index < Math.max(totalChats - plan.chats, 0) &&
					!is_god,
			})}
		>
			<div
				className={classNames(styles.chatUser, {
					[styles.active]: chatId === parseInt(currentChatId),
				})}
				onClick={handleChatClicked}
			>
				<div
					className={styles.chatUser__pic}
					// style={{ marginRight: isCollapsed ? "0px" : "10px" }}
				>
					<img
						src={`https://api.dicebear.com/5.x/micah/svg?seed=${chatId}`}
						alt="user"
					/>
				</div>
				<div className={styles.chatUser__info}>
					<div
						className={styles.chatUser__info__name}
						style={{ marginBottom: validEmail ? "10px" : "0px" }}
					>
						{/* Checking that name is not ip. if name is ip showing city. if name is ip and city not available fallbacks to name */}
						{name && isNaN(parseInt(name))
							? name
							: phone
								? country?.phone_code
									? `+${country?.phone_code}${phone}`
									: phone
								: city || country?.code
									? `${city ?? "Unknown"}, ${country?.code ?? "Unknown"}`
									: name}{" "}
					</div>
					<div className={styles.chatUser__info__lastMsg}>
						{intlFormatDistance(new Date(updatedAt), new Date())}
					</div>
					<div className={styles.device_icons_container}>
						{/* TODO: add Title and Alt */}
						{browserIcon ? (
							<img src={browserIcon} alt="" className={styles.device_icons} />
						) : (
							<></>
						)}
						{osIcon ? (
							<img src={osIcon} alt="" className={styles.device_icons} />
						) : (
							<></>
						)}
						{deviceIcon ? (
							<img src={deviceIcon} alt="" className={styles.device_icons} />
						) : (
							<></>
						)}
					</div>
					{/* {validEmail ? (
						<span className={styles.chatUser_email}>{validEmail}</span>
					) : null} */}
				</div>
			</div>
		</div>
	);
};

export default withErrorBoundary(ChatUser, "ChatUser");
