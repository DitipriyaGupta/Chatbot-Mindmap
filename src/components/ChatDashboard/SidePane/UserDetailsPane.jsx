import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import classNames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useHistory, useLocation, useParams } from "react-router-dom";
import styles from "./SidePane.module.css";
import { SmallLoader } from "../../common/NewLoader";
import JSONToHTML from "components/common/JSONToHTML";
import { toast } from "react-toastify";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import { Grid, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import { removeKeysWithNAValue } from "../../LeadsData/AIAnalysis.jsx";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import getBrowser from "components/common/getBrowser";
import getOS from "components/common/getOS";
import getDevice from "components/common/getDevice";

const useStyles = makeStyles({
	root: {
		// flexGrow: 1,
		width: "100%",
		borderRadius: "8px",
	},
	tab: {
		minWidth: 0,
		padding: 0,
		width: 100,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "0.6rem 1rem",
		borderBottom: "2px solid var(--background)",
	},
	title: {
		fontWeight: "400",
		color: "var(--color5)",
		textTransform: "uppercase",
	},
	articleRoot: {
		padding: "0.6rem 1.2rem 0.6rem 1rem",
		position: "relative",
		borderBottom: "2px solid var(--background)",
	},
	refBody: {
		maxHeight: "calc(100vh - 150px)",
		overflowY: "auto",
	},
	showMoreButton: {
		display: "flex",
		margin: " 0 auto",
		marginTop: "0.5rem",
		"& .MuiButton-label": {
			// color: "var(--primary)",
		},
	},
	iconButton: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		borderRadius: "10px",
		width: "100%",
	},

	optionsContainer: {
		display: "flex",
		flexDirection: "column",
		background: "white",
		borderRadius: "5px",
		boxShadow: "0 0 0 1px gray",
	},
	device_icon: {
		width: "24px",
		height: "24px",
		marginLeft: "0.1rem",
	},
	detail_row: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: "0.36rem",
	},
	detail_icon: {
		fontSize: "1.28rem",
		color: "var(--color5)",
		width: 21,
		height: 21,
	},
});

function UserDetailsPane({ currUser }) {
	const { Get } = useApiCall();
	const classes = useStyles();
	const history = useHistory();
	const location = useLocation();
	const axiosCancelSource = axios.CancelToken.source();
	const searchParams = useMemo(
		() => new URLSearchParams(location.search),
		[location.search]
	);
	const { chatId: chat_id } = useParams();
	const email = currUser?.email
		?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
		?.pop();

	const showUserDetails = searchParams.get("show_user_details") ?? false;
	const [aiAnalysis, setAiAnalysis] = useState();
	const [analysisLoading, setAnalysisLoading] = useState(true);

	async function getAIAnalysis(chat_id) {
		try {
			setAnalysisLoading(true);
			const response = await Get(1, "get_ai_leads_analysis", { chat_id });
			setAiAnalysis(removeKeysWithNAValue(response.data.data));
		} catch (error) {
			console.error(error);
		} finally {
			setAnalysisLoading(false);
		}
	}
	const browserIcon = useMemo(
		() => getBrowser(currUser?.browser),
		[currUser?.browser]
	);
	const osIcon = useMemo(() => getOS(currUser?.os), [currUser?.os]);
	const deviceIcon = useMemo(
		() => getDevice(currUser?.device),
		[currUser?.device]
	);
	// TODO: Hide pane on chat switch
	// TODO: Add the  email check to the user details pane
	useEffect(() => {
		if (showUserDetails) {
			getAIAnalysis(chat_id);
		}
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [chat_id, showUserDetails]);

	const emailOpenToast = () => {
		toast.info("Opening Email Client...", {
			autoClose: 2000,
			pauseOnHover: false,
			pauseOnFocusLoss: false,
		});
	};

	const closeRefs = () => {
		if (searchParams.has("show_user_details")) {
			searchParams.delete("show_user_details");
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}
	};

	return (
		<div
			className={classNames(styles.rightChatContainer, {
				[styles.open]: showUserDetails,
			})}
		>
			<div className={classes.header}>
				<Typography variant="body1" className={classes.title}>
					User Details
				</Typography>
				<Tooltip title="Close">
					<IconButton
						size="medium"
						color="inherit"
						aria-label="close"
						component="button"
						onClick={closeRefs}
					>
						<Close />
					</IconButton>
				</Tooltip>
			</div>
			<div className={classes.refBody}>
				<Grid container>
					<Typography
						variant="body1"
						style={{
							fontWeight: "bold",
							textTransform: "uppercase",
							padding: "0.28rem 1rem",
						}}
					>
						User Information
					</Typography>
				</Grid>
				<Grid container spacing={2} padding={2}>
					{currUser?.name && (
						<Grid item xs={12} className={classes.detail_row}>
							<PersonIcon className={classes.detail_icon} />
							<Typography variant="body2">{currUser.name}</Typography>
						</Grid>
					)}
					{email && (
						<Grid item xs={12} className={classes.detail_row}>
							<AlternateEmailIcon className={classes.detail_icon} />
							<Typography variant="body2">{email}</Typography>
						</Grid>
					)}

					{currUser?.phone && (
						<Grid item xs={12} className={classes.detail_row}>
							<LocalPhoneIcon className={classes.detail_icon} />
							<Typography variant="body2">{currUser.phone ?? "N/A"}</Typography>
						</Grid>
					)}

					{currUser?.city && (
						<Grid item xs={12} className={classes.detail_row}>
							<LocationOnIcon className={classes.detail_icon} />
							<Typography variant="body2">
								{currUser.city}, {currUser?.country?.name}
							</Typography>
						</Grid>
					)}

					{browserIcon ? (
						<Grid item xs={12} className={classes.detail_row}>
							<img src={browserIcon} alt="" className={classes.detail_icon} />
							<Typography variant="body2">{currUser?.browser}</Typography>
						</Grid>
					) : (
						<></>
					)}
					{osIcon ? (
						<Grid item xs={12} className={classes.detail_row}>
							<img src={osIcon} alt="" className={classes.detail_icon} />
							<Typography variant="body2">{currUser?.os}</Typography>
						</Grid>
					) : (
						<></>
					)}
					{deviceIcon ? (
						<Grid item xs={12} className={classes.detail_row}>
							<img src={deviceIcon} alt="" className={classes.detail_icon} />
							<Typography variant="body2">{currUser?.device}</Typography>
						</Grid>
					) : (
						<></>
					)}

					<Grid item xs={12} className={classes.detail_row}>
						{email && (
							<Button
								variant="text"
								color="primary"
								startIcon={<EmailIcon sx={{ color: "var(--primary)" }} />}
								onClick={() => {
									window.open("mailto:" + email, "_self");
									emailOpenToast();
								}}
							>
								Email
							</Button>
						)}
						{currUser.phone && (
							<Button
								variant="text"
								color="primary"
								startIcon={<WhatsAppIcon sx={{ color: "var(--primary)" }} />}
								onClick={() => {
									window.open(
										`https://wa.me/${currUser?.country?.country_code ?? ""}${
											currUser?.phone
										}`,
										"_blank"
									);
								}}
							>
								WhatsApp
							</Button>
						)}
					</Grid>
				</Grid>
				<hr
					style={{
						border: "1px solid var(--background)",
						width: "100%",
						margin: "0",
					}}
				/>
				<Grid container>
					<Typography
						variant="body1"
						style={{
							fontWeight: "bold",
							textTransform: "uppercase",
							padding: "0.28rem 1rem",
						}}
					>
						Leads Information
					</Typography>
				</Grid>
				<Grid container spacing={2} padding={2}>
					<Grid item xs={12}>
						{analysisLoading ? (
							<SmallLoader />
						) : (
							<>{aiAnalysis && <JSONToHTML data={aiAnalysis} />}</>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
}

export default withErrorBoundary(UserDetailsPane, "UserDetailsPane");
