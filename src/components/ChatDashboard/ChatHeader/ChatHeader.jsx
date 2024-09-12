import React, { useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ChatHeader.module.css";
import getBrowser from "components/common/getBrowser";
import getOS from "components/common/getOS";
import getDevice from "components/common/getDevice";
import { useHistory } from "react-router-dom";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import { Delete, Info } from "@mui/icons-material";
import Swal from "sweetalert2/dist/sweetalert2";
import { PLAN_UNLIMITED } from "components/common/constants";
import { useApiCall } from "components/common/appHooks.js";
import { makeStyles } from "@mui/styles";
import { MoreVert } from "@mui/icons-material";
import { useOrgContext } from "context/OrgContext";
import { useUserContext } from "context/UserContext";
import { usePlanContext } from "context/PlanContext";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";

const useStyles = makeStyles((theme) => ({
	desktop_icons: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		gap: "5px",
		[theme.breakpoints.down("sm")]: {
			display: "none",
		},
	},
	mobile_menu: {
		display: "none",
		[theme.breakpoints.down("sm")]: {
			display: "flex",
		},
	},
	profile_icon_button: {
		padding: "0.1rem",
		transition: "all 0.15s",
	},
}));

const ChatHeader = ({
	currUser: { browser, device, os, name, country, city, phone },
	handleJoinChat,
	handleLeaveChat,
	hasJoinedChat,
}) => {
	const { Post } = useApiCall();
	const history = useHistory();
	const classes = useStyles();
	const { chatId: chat_id } = useParams();

	// const email = currUser?.email
	// 	?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
	// 	?.pop();
	const {
		org: { host_url },
		isDemo,
	} = useOrgContext();
	const {
		plan: { live_chat },
	} = usePlanContext();
	const location = useLocation();
	const searchParams = useMemo(
		() => new URLSearchParams(location.search),
		[location.search]
	);

	const showUserDetails = searchParams.get("show_user_details") ?? false;

	const browserIcon = useMemo(() => getBrowser(browser), [browser]);
	const osIcon = useMemo(() => getOS(os), [os]);
	const deviceIcon = useMemo(() => getDevice(device), [device]);

	async function deleteDemoChat() {
		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `This Chat will no longer exist`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "delete_chat_from_demo", { chat_id });
				toast.success(`Chat Deleted Successfully`);
				history.replace(`/${host_url}/`);
				window.location.reload();
			}
		} catch (error) {
			toast.error(error?.response?.data?.message ?? "Something went wrong");
		}
	}

	const toggleShowUserInfo = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("show_user_details", true);
		history.push({
			pathname: url.pathname,
			search: url.search,
		});
	};

	return (
		<div className={styles.chat_header}>
			<KeyboardBackspaceIcon
				className={styles.back_icon}
				onClick={() => history.push("/")}
			/>

			<img
				className={styles.header_icon}
				src={`https://api.dicebear.com/5.x/micah/svg?seed=${chat_id}`}
				alt="Avatar"
			/>
			{/* Checking that name is not ip. if name is ip showing city. if name is ip and city not available fallbacks to name */}
			<h4>
				{name && isNaN(parseInt(name))
					? name
					: phone
						? country?.phone_code
							? `+${country?.phone_code}${phone}`
							: phone
						: city || country?.code
							? `${city ?? "Unknown"}, ${country?.code ?? "Unknown"}`
							: name}{" "}
				{/* only showing city and country if name is not ip and city or country is available */}
				{name && isNaN(parseInt(name)) ? (
					phone ? (
						<>
							<br />{" "}
							<span style={{ fontSize: "small" }}>
								{country?.phone_code
									? `+${country?.phone_code}${phone}`
									: phone}
							</span>
						</>
					) : city || country?.code ? (
						<>
							<br />{" "}
							<span style={{ fontSize: "small" }}>
								{city ?? "Unknown"}, {country?.code ?? "Unknown"}
							</span>
						</>
					) : (
						<></>
					)
				) : (
					<></>
				)}
			</h4>
			<div className={styles.device_icons_container}>
				{/* TODO: add Title and Alt */}
				<div className={classes.desktop_icons}>
					<Tooltip title="Show User Info">
						<IconButton
							onClick={toggleShowUserInfo}
							className={classes.profile_icon_button}
						>
							<Info
								sx={{
									color: showUserDetails ? "var(--primary)" : "var(--color5)",
								}}
							/>
						</IconButton>
					</Tooltip>
					{browserIcon ? (
						<Tooltip title={`Browser: ${browser}`}>
							<img src={browserIcon} alt="" className={styles.device_icons} />
						</Tooltip>
					) : (
						<></>
					)}
					{osIcon ? (
						<Tooltip title={`OS: ${os}`}>
							<img src={osIcon} alt="" className={styles.device_icons} />
						</Tooltip>
					) : (
						<></>
					)}
					{deviceIcon ? (
						<Tooltip title={`Device: ${device}`}>
							<img src={deviceIcon} alt="" className={styles.device_icons} />
						</Tooltip>
					) : (
						<></>
					)}
					{/* {email ? (
						<Tooltip title="Email User">
							<img
								src={mail}
								alt="mail"
								className={styles.device_icons}
								onClick={() => {
									window.open("mailto:" + email, "_self");
									emailOpenToast();
								}}
								style={{
									cursor: "pointer",
								}}
							/>
						</Tooltip>
					) : null} */}
				</div>
				{live_chat === PLAN_UNLIMITED ? (
					hasJoinedChat ? (
						<Button
							color="secondary"
							variant="outlined"
							size="small"
							onClick={handleLeaveChat}
						>
							Leave Chat
						</Button>
					) : (
						<Button color="primary" size="small" onClick={handleJoinChat}>
							Join Chat
						</Button>
					)
				) : null}
				<div className={classes.mobile_menu}>
					<IconButton onClick={toggleShowUserInfo}>
						<MoreVert />
					</IconButton>
				</div>
			</div>
		</div>
	);
};

export default withErrorBoundary(ChatHeader, "ChatHeader");
