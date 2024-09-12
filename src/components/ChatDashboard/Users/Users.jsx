import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, {
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import CircularProgress from "@mui/material/CircularProgress";
import InfoIcon from "@mui/icons-material/Info";
import ChatUser from "./ChatUser/ChatUser";
import styles from "./Users.module.css";
import {
	Button,
	Tooltip,
	Typography,
	// Checkbox,
	// FormControl,
	// FormControlLabel,
	// Radio,
	// RadioGroup,
	// Tooltip,
	// Typography,
} from "@mui/material";
// import FilterListIcon from "@mui/icons-material/FilterList";
import { useHistory } from "react-router-dom";
import { useOrgContext } from "context/OrgContext";
import { useUserContext } from "context/UserContext";
import AddChatsDialog from "components/God/AddChatsDialog";
import { DialogLoader } from "components/common/NewLoader";
import { usePlanContext } from "context/PlanContext";
import { PLAN_UNLIMITED } from "components/common/constants";
import { useNotificationChannelContext } from "context/NotificationContext";
import { useApiCall } from "components/common/appHooks";
import UserList from "staticData/UserList.json"
const Users = () => {	
	const { Get } = useApiCall();
	// const [chatLoading, setChatLoading] = useState(false);
	const history = useHistory();
	const { notificationChannel } = useNotificationChannelContext();
	const {
		org: { host_url },
		isDemo,
	} = useOrgContext();
	const {
		user: { is_god },
	} = useUserContext();
	const { plan } = usePlanContext();

	const [isOpenAddChatsDialog, setIsOpenAddChatsDialog] = useState(false);
	const [chatUsers, setChatUsers] = useState([]);
	const [totalChats, setTotalChats] = useState(0);
	const nextPage = useRef(1);

	const [loading, setLoading] = useState(true);
	// const [isFilterOn, setIsFilterOn] = useState(false);

	const getMessages = useCallback(async () => {
		try {
			setLoading(true);
			//setChatLoading(true);
			let res = UserList
			// await Get(1, "get_all_org_chats", {
			// 	host_url: decodeURIComponent(host_url),
			// 	page: nextPage.current,
			// 	filter: {
			// 		has_messages: true,
			// 	},
			// });

			let page;
			try {
				setTotalChats(res.total);
				if (res.data.next_page_url) {
					let params = new URL(res.data.next_page_url).searchParams;
					page = params.get("page");
				}
			} catch (error) {
				console.log("No Next Page");
			}
			nextPage.current = page;
			setChatUsers((prev) =>
				[...prev, ...res.data.data].filter(
					(user, idx, arr) =>
						idx === arr.findIndex((newUser) => newUser.id === user.id)
				)
			);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		} finally {
			// setChatLoading(false);
		}
	}, [host_url]);

	// const handleOptionChange = useCallback(
	// 	(event) => {
	// 		const option = event.target.value;
	// 		setSelectedOption(option);
	// 		const url = new URL(window.location.href);
	// 		if (option === "true" || option === "false")
	// 			url.searchParams.set("has_messages", option);
	// 		else url.searchParams.delete("has_messages");
	// 		history.replace(url.pathname + url.search);
	// 		setChatUsers([]);
	// 		nextPage.current = 1;
	// 		getMessages(option);
	// 	},
	// 	[getMessages, history]
	// );

	async function resetChats() {
		nextPage.current = 1;
		setChatUsers([]);
		getMessages();
		const url = new URL(window.location.href);
		if (!url.searchParams.has("has_messages")) {
			url.searchParams.set("has_messages", "true");
			history.replace(url.pathname + url.search);
		}
	}
	useEffect(() => {
		resetChats();
	}, [getMessages, host_url]);

	useEffect(() => {
		notificationChannel?.listen("ChatsUpdate", async () => {
			// TODO: use common function
			let res = await Get(1, "get_all_org_chats", {
				host_url: decodeURIComponent(host_url),
				page: 1,
				filter: {
					has_messages: true,
				},
			});
			let page;
			try {
				setTotalChats(res.data.data.total);
				if (res.data.data.next_page_url) {
					let params = new URL(res.data.data.next_page_url).searchParams;
					page = params.get("page");
				}
			} catch (error) {
				console.log("No Next Page");
			}
			nextPage.current = page;
			setChatUsers(res.data.data.data);
		});

		return () => {
			notificationChannel?.stopListening("ChatsUpdate");
		};
	}, [notificationChannel]);

	return (
		<>
			{/* TODO:disabled for now */}
			{/* <FormControl
				variant="standard"
				component="fieldset"
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Tooltip title="Filter users by messages" arrow>
					<FormControlLabel
						control={
							<Checkbox
								checkedIcon={<FilterListIcon color="secondary" />}
								icon={<FilterListIcon />}
								checked={isFilterOn}
								onChange={(e) => setIsFilterOn(e.target.checked)}
							/>
						}
						label={<Typography variant="subtitle1">Filter Chats</Typography>}
					/>
				</Tooltip>
				{isFilterOn ? (
					<RadioGroup
						name="option"
						value={selectedOption}
						onChange={handleOptionChange}
						style={{ flexDirection: "row", justifyContent: "center" }}
					>
						<Tooltip title="Only show chats with messages" arrow>
							<FormControlLabel
								style={{ marginLeft: "auto", marginRight: "auto" }}
								value="true"
								control={<Radio />}
								label={
									<Typography variant="subtitle2">With Messages</Typography>
								}
							/>
						</Tooltip>
						<Tooltip title="Only show chats without messages" arrow>
							<FormControlLabel
								style={{ marginLeft: "auto", marginRight: "auto" }}
								value="false"
								control={<Radio />}
								label={<Typography variant="subtitle2">Empty Chats</Typography>}
							/>
						</Tooltip>
						<Tooltip title="Show all chats" arrow>
							<FormControlLabel
								style={{ marginLeft: "auto", marginRight: "auto" }}
								value="undefined"
								control={<Radio />}
								label={<Typography variant="subtitle2">All</Typography>}
							/>
						</Tooltip>
					</RadioGroup>
				) : null}
			</FormControl> */}
			<InfiniteScroll
				dataLength={chatUsers.length} //This is important field to render the next data
				next={() => getMessages()}
				hasMore={nextPage.current}
				// loader={
				// 	<CircularProgress
				// 		style={{
				// 			color: "var(--primary)",
				// 			width: 20,
				// 			height: 20,
				// 			marginTop: 10,
				// 		}}
				// 	/>
				// }
				scrollableTarget="a11y-tabpanel-0"
				endMessage={
					<p style={{ textAlign: "center" }}>
						<b>
							{chatUsers.length
								? "Yay! You have seen it all"
								: "No Chats Available"}
						</b>
					</p>
				}
				className={styles.chats_container}
				style={{ overflowX: "hidden" }}
			>
				{isDemo && is_god ? (
					<Button onClick={() => setIsOpenAddChatsDialog(true)}>
						Add Chats
					</Button>
				) : null}
				{plan.chats !== PLAN_UNLIMITED ? (
					<Typography
						align="center"
						variant="subtitle1"
						sx={{
							m: 1,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 1,
						}}
					>
						{totalChats}/{plan.chats} Chats Consumed{" "}
						<Tooltip
							title={`${plan.chats} chats allowed in current subscription`}
						>
							<InfoIcon fontSize="small" />
						</Tooltip>
					</Typography>
				) : null}
				{/* TODO: Animate Position Change */}
				{chatUsers.map((user, index) => (
					<ChatUser key={user.id} {...{ user, index, totalChats }} />
				))}
				{loading ? (
					<CircularProgress
						style={{
							color: "var(--primary)",
							width: 20,
							height: 20,
							marginTop: 10,
						}}
					/>
				) : nextPage.current ? (
					<Button
						variant="contained"
						color="primary"
						style={{ margin: "10px auto" }}
						onClick={() => getMessages()}
					>
						Load More
					</Button>
				) : null}
			</InfiniteScroll>
			<Suspense fallback={<DialogLoader />}>
				{isOpenAddChatsDialog ? (
					<AddChatsDialog
						open={isOpenAddChatsDialog}
						onClose={() => {
							setIsOpenAddChatsDialog(false);
							resetChats();
						}}
					/>
				) : null}
			</Suspense>
		</>
	);
};

export default withErrorBoundary(Users, "Users");
