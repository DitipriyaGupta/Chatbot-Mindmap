import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./Votes.module.css";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Tabs, Tab, Paper, Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CircularProgress from "@mui/material/CircularProgress";
import classNames from "classnames";
import { useOrgContext } from "context/OrgContext";
import { useApiCall } from "components/common/appHooks";
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
});
const Votes = () => {
	const { Post, Get } = useApiCall();
	const classes = useStyles();
	const history = useHistory();
	const {
		org: { host_url },
	} = useOrgContext();

	const params = new URLSearchParams(window.location.search);
	const [votedMessages, setVotedMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const currentPage = useRef(1);
	const nextPage = useRef(1);
	const [tab, setTab] = useState(Number(params.get("filter")) ?? 0);
	const message_id = params.get("message_id");
	const filteredMessages = useMemo(() => {
		if (tab === 0) {
			return votedMessages;
		}
		let pivot = tab === 1 ? 1 : tab === 2 ? 0 : -1;
		return votedMessages.filter((message) => message.vote === pivot);
	}, [votedMessages, tab]);

	const isMessageArrEmpty = useMemo(
		() => filteredMessages.length === 0,
		[filteredMessages]
	);
	// TODO: get only voted or all from Backend
	const getVotedMessages = async () => {
		try {
			// setChatLoading(true);
			setLoading(true);
			let res = await Get(1, "get_voted_messages", {
				host_url: decodeURIComponent(host_url),
				page: nextPage.current,
			});
			// console.log(res.data.data);
			setVotedMessages((prev) => [...prev, ...res.data.data.data]);
			currentPage.current = res.data.data.current_page;
			setLoading(false);
			let page;

			try {
				if (res.data.data.next_page_url) {
					let params = new URL(res.data.data.next_page_url).searchParams;
					page = params.get("page");
				}
			} catch (error) {
				console.log("No Next Page");
			}
			nextPage.current = page;
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	const handleChange = (e, option) => {
		setTab(option);
		const url = new URL(window.location.href);
		url.searchParams.set("filter", option);
		history.replace(url.pathname + url.search);
	};

	useEffect(() => {
		currentPage.current = 1;
		nextPage.current = 1;
		setVotedMessages([]);
		getVotedMessages();
	}, [host_url]);
	return (
		<>
			<Paper
				// square
				className={classes.root}
				disablelevation="true"
				style={{
					boxShadow: "none",
				}}
			>
				<Tabs
					value={tab}
					onChange={handleChange}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="Chat Tabs"
				>
					<Tab
						classes={{
							root: classes.tab,
						}}
						label="All"
					/>
					<Tab
						classes={{
							root: classes.tab,
						}}
						label="UPVOTED"
					/>
					<Tab
						classes={{
							root: classes.tab,
						}}
						label="DOWNVOTED"
					/>
				</Tabs>
			</Paper>
			{isMessageArrEmpty && !loading && (
				<p className={styles.noticeMessage}>No messages present</p>
			)}
			<InfiniteScroll
				dataLength={votedMessages?.length || 0} //This is important field to render the next data
				next={getVotedMessages}
				hasMore={nextPage.current}
				// loader={<CircularProgress style={{ color: "var(--primary)" }} />}
				endMessage={
					<p className={styles.noticeMessage}>
						{isMessageArrEmpty ? "" : "Yay! You have seen it all"}
					</p>
				}
				className={styles.votedContainer}
			>
				{filteredMessages?.map((message, index) => {
					return (
						<Message
							message={message}
							key={message.id}
							currentPage={message.page_number}
							message_id={message_id}
						/>
					);
				})}
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
						onClick={getVotedMessages}
					>
						Load More
					</Button>
				) : null}
			</InfiniteScroll>
		</>
	);
};
/**
 * Represents a message component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array.<{
 *   id: number,
 *   sender_id: number,
 *   message: string,
 *   unanswered: number,
 *   vote: (number | null),
 *   chat_id: number,
 *   created_at: string,
 *   updated_at: string,
 *   sender: {
 *     id: number,
 *     name: string,
 *     email: string,
 *     phone: (string | null),
 *     ip_address: (string | null),
 *     email_verified_at: (string | null),
 *     created_at: (string | null),
 *     updated_at: string
 *   }
 * }>} props.messages - An array of message objects with specific properties.
 * @param {number} props.currentPage - The current page of messages being displayed.
 * @param {string} props.message_id - The unique identifier for the message component.
 * @returns {JSX.Element} A React component that renders messages.
 */
const Message = ({ message, currentPage, message_id }) => {
	const history = useHistory();
	const {
		org: { host_url },
	} = useOrgContext();

	useEffect(() => {
		try {
			if (message.id === Number(message_id)) {
				const message = document.getElementById(
					`vote_message_left_${message_id}`
				);
				if (message)
					message.scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "center",
					});
			}
		} catch (error) {
			console.error(error);
		}
	}, []);

	async function handleClick(message) {
		history.push(
			`/${host_url}/${message.chat_id}?tab=2&message_id=${message.id}&page=${currentPage}`
		);
	}

	return (
		<>
			<div
				key={message.id}
				id={`vote_message_left_${message.id}`}
				className={classNames(styles.votedMessage, {
					[styles.active]: Number(message_id) === Number(message.id),
				})}
				onClick={() => handleClick(message)}
			>
				<p className={classNames(styles.message)}>{message.message}</p>
				{message.vote && message.vote > 0 ? (
					<ThumbUpAltIcon
						className={styles.icon}
						style={{ color: "#0f9d58", fontSize: "1.2rem" }}
					/>
				) : (
					<ThumbDownAltIcon
						className={styles.icon}
						style={{ color: "#db4437", fontSize: "1.2rem" }}
					/>
				)}
			</div>
		</>
	);
};
export default withErrorBoundary(Votes, "Votes");
