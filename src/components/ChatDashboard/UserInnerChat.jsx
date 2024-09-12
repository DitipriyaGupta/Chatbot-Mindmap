import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Skeleton, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import styles from "./UserInnerChat.module.css";
import { Button } from "@mui/material";
import { useOrgContext } from "context/OrgContext";
import {
	PLAN_UNLIMITED,
	TIMELINE_EVENT,
	URL_PATTERN_REGEX,
	WHATSAPP_BROWSER,
} from "components/common/constants";
import MetaHelmet from "components/common/MetaHelmet";
import { useApiCall } from "components/common/appHooks.js";
import ChatBox from "./ChatBox/ChatBox";
import Swal from "sweetalert2/dist/sweetalert2";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { usePlanContext } from "context/PlanContext";
import { useNotificationChannelContext } from "context/NotificationContext";
import ChatHeader from "./ChatHeader/ChatHeader";
import TimelineEvent from "./TimelineEvent";
import allmessages from "staticData/messages/messages.json";
import allmessagesinfo from "staticData/messages/messagesInfo.json";
const UserInnerChat = ({ currUser, setCurrUser }) => {
	const { Post, Get } = useApiCall();
	const { chatId: chat_id } = useParams();
	const {
		org: { host_url, ...org },
	} = useOrgContext();
	const { notificationChannel } = useNotificationChannelContext();
	const {
		plan: { live_chat },
	} = usePlanContext();

	const { register, handleSubmit, reset: resetForm, watch } = useForm();
	const history = useHistory();

	const chatChannel = useRef({});
	const typingTimeout = useRef();

	const [messages, setMessages] = useState([]);
	const [hasJoinedChat, setHasJoinedChat] = useState(false);
	const [isUserTyping, setIsUserTyping] = useState(false);
	const { name, browser, id: user_id } = currUser;
	const isWhatsappChat = browser === WHATSAPP_BROWSER;
	// TODO: get from chat config
	const useLinkPreview = !isWhatsappChat;
	const [loading, setLoading] = useState(false);
	const chatRef = useRef(null);

	async function getUserChats(update = false) {
		try {
			if (!update) setLoading(true);
			// const response = await Get(1, "get_chat_messages_unpaginated", {
			// 	chat_id,
			// });
			
			const chat = allmessages[chat_id]
			
			setMessages(chat.data);

			try {
				const search = new URL(window.location.href).searchParams;

				if (search.has("message_id")) search.delete("message_id");
				history.push({ search: search.toString() });
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		chatRef.current?.scrollIntoView({ block: "end", inline: "end" });
	}, [messages]);
 
	async function getChatInfo() {
		try {
			// const [chatInfo, chatUsers] = await Promise.all([
			// 	Get(1, "get_chat_info", {
			// 		chat_id,
			// 	}),
			// 	Get(1, "get_chat_users", {
			// 		chat_id,
			// 	}),
			// ]);
			// const response = await Get(1, "get_chat_info", {
			// 	chat_id,
			// });
			const response = allmessagesinfo[chat_id]
			setCurrUser({ ...(response.data.creator ?? {}) });
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		if (!chat_id) return;
		getUserChats();
		getChatInfo();
	}, [host_url, chat_id]);

	const message = watch("message");
	useEffect(() => {
		if (hasJoinedChat && message) {
			chatChannel.current?.whisper?.("typing", {});
		}
	}, [message, chat_id, hasJoinedChat]);

	useEffect(() => {
		if (hasJoinedChat) {
			chatChannel.current?.listenForWhisper?.("typing", (data) => {
				clearTimeout(typingTimeout.current);
				setIsUserTyping(true);
				typingTimeout.current = setTimeout(() => {
					setIsUserTyping(false);
				}, 3000);
			});
		}
	}, [chat_id, hasJoinedChat]);

	async function handleSendMessage({ message }) {
		try {
			const response = await Post(
				1,
				"send_message_dashboard",
				{ message, chat_id },
				null,
				{ showProgress: false }
			);
			setMessages((prev) => [...prev, response.data.data]);
			resetForm();
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		const unblock = history.block((location) => {
			if (hasJoinedChat && location.pathname !== window.location.pathname) {
				try {
					Swal.fire({
						title: `Are you sure?`,
						text: `You are about to leave this chat`,
						icon: "warning",
						showCancelButton: true,
					}).then((result) => {
						if (result.isConfirmed) {
							unblock();
							handleLeaveChat();
							history.push(location);
						}
					});
				} catch (error) {
					toast.error(error?.response?.data?.message ?? "Something went wrong");
				}
				return false;
			}
			return true;
		});
		return () => {
			unblock();
			if (hasJoinedChat) window?.Echo?.leave?.(`chat.${chat_id}`);
		};
	}, [chat_id, hasJoinedChat]);

	async function handleJoinChat() {
		getUserChats(true);
		setHasJoinedChat(true);
		chatChannel.current = window?.Echo?.join?.(`chat.${chat_id}`)
			.here((users) => {
				console.log("here", users);
				if (!users.some((user) => user.id === user_id)) {
					toast.info("The user is offline");
				}
			})
			.joining((user) => {
				console.log("joining", user);
				toast.info(`${user.name ?? "User"} has joined the Chat`);
			})
			.leaving((user) => {
				console.log("leaving", user);
				toast.info(`${user.name ?? "User"} has left the Chat`);
			})
			.error((error) => {
				// TODO: Call SaveErrorLog
				console.error(error);
			});
		// TODO: Listen for typing whisper

		chatChannel.current?.listen?.("LiveMessage", (data) => {
			setMessages((prev) => [...prev, data.message]);
		});
	}
	async function handleLeaveChat() {
		setHasJoinedChat(false);
		notificationChannel?.stopListening("LiveMessage");
		window?.Echo?.leave?.(`chat.${chat_id}`);
	}

	useEffect(() => {
		notificationChannel?.listen("ChatMessageUpdate", (data) => {
			if (data?.message?.chat_id === parseInt(chat_id))
				setMessages((prev) => [...prev, data.message]);
		});

		return () => {
			handleLeaveChat();
			notificationChannel?.stopListening("ChatMessageUpdate");
		};
	}, [chat_id, notificationChannel, org.id]);

	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault(); // Prevent new line
			handleSubmit(handleSendMessage)(); // Manually submit the form
		}
	};

	if (!chat_id) return <></>;
	return (
		<>
			<MetaHelmet
				title={name ? name + "'s Chat" : "BeyondChats"}
				// description="Best educational videos on your fingertips. Start learning now!"
			/>
			<ChatHeader
				currUser={currUser}
				handleJoinChat={handleJoinChat}
				handleLeaveChat={handleLeaveChat}
				hasJoinedChat={hasJoinedChat}
			/>
			<div
				className={classNames(styles.innerChatContainer, {
					[styles.enable_live_chat]:
						hasJoinedChat && live_chat === PLAN_UNLIMITED,
				})}
			>
				{loading ? (
					<>
						<Skeleton
							variant="rectangular"
							width={Math.floor(Math.random() * 60 + 30) + "%"}
							height={118}
							style={{ borderRadius: 8 }}
						/>
						<Skeleton
							variant="rectangular"
							width={Math.floor(Math.random() * 60 + 30) + "%"}
							height={118}
							style={{ alignSelf: "flex-end", borderRadius: 8 }}
						/>
						<Skeleton
							variant="rectangular"
							width={Math.floor(Math.random() * 60 + 30) + "%"}
							height={118}
							style={{ borderRadius: 8 }}
						/>
						<Skeleton
							variant="rectangular"
							width={Math.floor(Math.random() * 60 + 30) + "%"}
							height={118}
							style={{ alignSelf: "flex-end", borderRadius: 8 }}
						/>
					</>
				) : (
					messages.map((message) =>
						message.type === TIMELINE_EVENT ? (
							<TimelineEvent event={message} key={"event_" + message.id} />
						) : isWhatsappChat ? (
							<ChatBox
								key={message.id}
								chat={{
									...message,
									message: Array.isArray(message.message)
										? message.message.join("\n\n")
										: message.message,
									fullMessage: Array.isArray(message.message)
										? message.message.join("\n\n")
										: message.message,
								}}
								isLastMessage
								getUserChats={getUserChats}
                                currUser={currUser}
                                whatsappChat
							/>
						) : Array.isArray(message.message) ? (
							message.message.map((partMessage, index) => {
								let isLastMessage = index === message.message.length - 1;
								let firstLink = "";
								if (isLastMessage && useLinkPreview) {
									firstLink = message.message
										.join(" ")
										.match(URL_PATTERN_REGEX)
										?.pop();
								}
						
								return (
									<>
										<ChatBox
											key={partMessage + message.id}
											chat={{
												...message,
												message: partMessage,
												fullMessage: message.message.join("\n"),
											}}
											lastTextMessage={isLastMessage}
											isLastMessage={(!firstLink)?isLastMessage:false}
											getUserChats={getUserChats}
											currUser={currUser}
										/>
										{firstLink ? (
											<ChatBox
												key={firstLink + message.id}
												chat={{
													...message,
													message: firstLink,
													fullMessage: message.message.join("\n"),
												}}
												linkPreview
												isLastMessage
												getUserChats={getUserChats}
												currUser={currUser}
											/>
										) : null}
									</>
								);
							})
						) : (
							<ChatBox
								key={message.id}
								chat={{ ...message, fullMessage: message.message }}
								getUserChats={getUserChats}
								currUser={currUser}
								isLastMessage
							/>
						)
					)
				)}
				{isUserTyping ? (
					<Typography variant="subtitle2" textAlign="center">
						User is Typing
					</Typography>
				) : null}
				{messages.length === 0 && !loading && (
					<div className={classNames(styles.noChatContainer)}>
						<h3>No Chats present</h3>
					</div>
				)}

				{/* {(isEditResponseOpen )&& (
                <InputBox
                    question={message}
                    message_id={params.get("message_id")}						
                />
            )} */}
				<div ref={chatRef} />
			</div>
			{live_chat === PLAN_UNLIMITED && hasJoinedChat ? (
				<form
					onSubmit={handleSubmit(handleSendMessage)}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 5,
						background: "var(--chat-bg)",
						maxHeight: 126,
						padding: 10,
					}}
				>
					<TextField
						label="Enter message"
						variant="outlined"
						{...register("message", { required: true })} // Register input with react-hook-form
						fullWidth
						size="small"
						maxRows={4}
						multiline={true}
						onKeyDown={handleKeyDown}
					/>
					<Button variant="text" type="submit">
						Send
					</Button>
				</form>
			) : null}
		</>
	);
};

export default withErrorBoundary(UserInnerChat, "UserInnerChat");
