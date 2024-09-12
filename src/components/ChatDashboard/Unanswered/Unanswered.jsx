import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useHistory, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
// import data from "./data";

import styles from "./Unanswered.module.css";
import { useOrgContext } from "context/OrgContext";
import classNames from "classnames";
import { useApiCall } from "components/common/appHooks";

const Unanswered = () => {
	const { Get } = useApiCall();
	const {
		org: { host_url },
	} = useOrgContext();

	const nextPage = useRef(1);
	const currentPage = useRef(1);
	const [messages, setMessages] = useState([
		{
			id: 58,
			sender_id: 14,
			message: "I don't understand",
			unanswered: 1,
			vote: null,
			chat_id: 10,
			created_at: "2023-03-27T10:42:11.000000Z",
			updated_at: "2023-03-27T10:42:11.000000Z",
			page_number: 1,
			chat: {
				id: 10,
				created_by: 14,
				org_id: 2,
				status: "new",
				created_at: "2023-03-27T10:36:01.000000Z",
				updated_at: "2023-09-19T20:31:29.000000Z",
				msg_count: 89,
				creator: {
					id: 14,
					name: "::ffff:14.139.45.244",
					email: "::ffff:14.139.45.244",
					phone: null,
					email_verified_at: null,
					created_at: "2023-03-27T10:36:01.000000Z",
					updated_at: "2023-04-26T12:43:25.000000Z",
					device: null,
					browser: null,
					os: null,
					city: null,
					country: null,
				},
			},
		},
	]);

	const [loading, setLoading] = useState(true);

	async function getMessages() {
		try {
			// setChatLoading(true);
			setLoading(true);
			let res = await Get(1, "get_unanswered_questions", {
				host_url: decodeURIComponent(host_url),
				page: nextPage.current,
			});
			currentPage.current = res.data.data.current_page;
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
			setMessages((prev) => [...prev, ...res.data.data.data]);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	}

	React.useEffect(() => {
		currentPage.current = 1;
		nextPage.current = 1;
		setMessages([]);
		getMessages();
	}, [host_url]);

	return (
		<>
			<InfiniteScroll
				dataLength={messages?.length || 0} //This is important field to render the next data
				next={getMessages}
				hasMore={nextPage.current}
				loader={<CircularProgress style={{ color: "var(--primary)" }} />}
				endMessage={
					<p className={styles.noticeMessage}>
						{messages.length > 0 ? "Yay! You have seen it all" : ""}
					</p>
				}
				className={styles.unansweredContainer}
			>
				{messages.length > 0 ? (
					messages.map((message) => (
						<Message key={message.id} message={message} />
					))
				) : !loading ? (
					<p className={styles.noticeMessage}>No Unanswered Questions</p>
				) : null}
			</InfiniteScroll>
		</>
	);
};

const Message = ({ message }) => {
	const history = useHistory();
	const { org } = useParams();
	const message_id = new URLSearchParams(window.location.search).get(
		"message_id"
	);

	async function handleClick(message) {
		const url = new URL(window.location.href);
		url.searchParams.set("tab", 1);
		url.searchParams.set("message_id", message.id);
		url.searchParams.set("page", message.page_number);
		history.push(`/${org}/${message.chat_id}${url.search}`);
	}

	return (
		<>
			<div
				className={styles.unansweredMessage}
				onClick={async () => handleClick(message)}
			>
				<p
					className={classNames(styles.message, {
						[styles.active]: message.id == message_id,
					})}
				>
					{message.message}
					<span className={styles.name}>{message?.chat?.creator?.name}</span>
				</p>
			</div>
		</>
	);
};

export default withErrorBoundary(Unanswered, "Unanswered");
