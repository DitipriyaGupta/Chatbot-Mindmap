import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./Reviews.module.css";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Tabs, Tab, Paper, Button, Typography, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CircularProgress from "@mui/material/CircularProgress";
import classNames from "classnames";
import { useOrgContext } from "context/OrgContext";
import { useApiCall } from "components/common/appHooks";
import {
	REVIEW_RESOLVED,
	REVIEW_UNRESOLVED,
	UPVOTE,
} from "components/common/constants";
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
const Reviews = () => {
	const { Post, Get } = useApiCall();
	const classes = useStyles();
	const history = useHistory();
	const {
		org: { host_url },
	} = useOrgContext();

	const params = new URLSearchParams(window.location.search);
	const [reviewedMessages, setReviewedMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const currentPage = useRef(1);
	const nextPage = useRef(1);
	const [tab, setTab] = useState(Number(params.get("filter")) ?? 0);
	const message_id = params.get("message_id");

	const isMessageArrEmpty = useMemo(
		() => reviewedMessages.length === 0,
		[reviewedMessages]
	);

	const getReviewedMessages = async () => {
		try {
			// setChatLoading(true);
			setLoading(true);
			let res = await Get(1, "review/view_all", {
				page: nextPage.current,
				review_status: tab === 0 ? REVIEW_UNRESOLVED : REVIEW_RESOLVED,
			});
			// console.log(res.data.data);
			setReviewedMessages((prev) => [...prev, ...res.data.data.data]);
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
		setReviewedMessages([]);
		getReviewedMessages();
	}, [tab, host_url]);
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
						label="Unresolved"
					/>
					<Tab
						classes={{
							root: classes.tab,
						}}
						label="Resolved"
					/>
				</Tabs>
			</Paper>
			{isMessageArrEmpty && !loading && (
				<p className={styles.noticeMessage}>No messages present</p>
			)}
			<InfiniteScroll
				dataLength={reviewedMessages?.length || 0} //This is important field to render the next data
				next={getReviewedMessages}
				hasMore={nextPage.current}
				// loader={<CircularProgress style={{ color: "var(--primary)" }} />}
				endMessage={
					<p className={styles.noticeMessage}>
						{isMessageArrEmpty ? "" : "Yay! You have seen it all"}
					</p>
				}
				className={styles.votedContainer}
			>
				{reviewedMessages?.map((remark, index) => {
					return (
						<Message
							remark={remark.remark || "No Remark"}
							message={remark.message}
							key={remark.message.id}
							message_id={message_id}
							vote={remark.vote}
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
						onClick={getReviewedMessages}
					>
						Load More
					</Button>
				) : null}
			</InfiniteScroll>
		</>
	);
};

const Message = ({ message, message_id, remark, vote }) => {
	const history = useHistory();
	const {
		org: { host_url },
	} = useOrgContext();

	const messageRef = useRef(null);

	useEffect(() => {
		try {
			if (message.id === Number(message_id)) {
				if (messageRef.current)
					messageRef.current.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
						inline: "nearest",
					});
			}
		} catch (error) {
			console.error(error);
		}
	}, []);

	async function handleClick(message) {
		history.push(
			`/${host_url}/${message.chat_id}?tab=1&message_id=${message.id}`
		);
	}

	return (
		<>
			<div
				key={message.id}
				ref={messageRef}
				className={classNames(styles.votedMessage, {
					[styles.active]: Number(message_id) === Number(message.id),
				})}
				onClick={() => handleClick(message)}
			>
				<Grid container alignItems="center" spacing={1}>
					<Grid item xs={2}>
						{vote === UPVOTE ? (
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
					</Grid>
					<Grid item container display="flex" flexDirection="column" xs={10}>
						<Typography
							variant="subtitle1"
							fontWeight={500}
							className={classNames(styles.message)}
						>
							{remark}
						</Typography>
						<Typography
							variant="subtitle2"
							className={classNames(styles.message)}
						>
							{message.message}
						</Typography>
					</Grid>
				</Grid>
			</div>
		</>
	);
};
export default withErrorBoundary(Reviews, "Reviews");
