import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import classNames from "classnames";
import React, {
	lazy,
	Suspense,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styles from "./ChatBox.module.css";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CachedIcon from "@mui/icons-material/Cached";
import Markdown from "react-markdown";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import { TextField, Tooltip, Typography } from "@mui/material";
import MuiDialog from "../../common/MuiDialog";
import { toast } from "react-toastify";
import { Info } from "@mui/icons-material";
import { useHistory, useLocation } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import {
	// ACTION_BUTTON,
	// ACTION_MCQ,
	// ACTION_TEXT_INPUT,
	BUSINESS_ACTION_CLICK,
	DOWNVOTE,
	ORG_BOT_ID,
	ORG_END_USER_ID,
	UPVOTE,
} from "components/common/constants";
import { useChatConfigContext } from "components/Config/ChatConfigContext/ChatConfigContext";
import { format } from "date-fns";
import { useApiCall } from "components/common/appHooks";
import convertLinksToMarkdown from "components/common/convertLinksToMarkdown";
import { trackGAEvent } from "components/common/ga";
import LinkPreview from "../LinkPreview/LinkPreview";
import BusinessAction from "../BusinessAction";
import { useUserContext } from "context/UserContext";
import { DialogLoader } from "components/common/NewLoader";

const MessageReviews = lazy(() => import("./MessageReviews"));
const AddMessageReview = lazy(() => import("./AddMessageReview"));
const RefreshResponseDialog = lazy(() => import("./RefreshResponseDialog"));

/**
 * Represents a chat message component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.chat.action - The action object (Whatsup Us).
 * @param {number} props.chat.action.id - The unique identifier of the action.
 * @param {string} props.chat.action.name - The name of the action.
 * @param {number} props.chat.action.ordering - The ordering of the action.
 * @param {number} props.chat.action.org_id - The organization ID of the action.
 * @param {number} props.chat.action.visibility - The visibility of the action.
 * @param {string} props.chat.action.created_at - The timestamp when the action was created.
 * @param {string} props.chat.action.updated_at - The timestamp when the action was last updated.
 * @param {number} props.chat.action.type - The type of the action.
 * @param {Object} props.chat.action.detail - Additional details of the action.
 * @param {string} props.chat.action.detail.link - The link associated with the action.
 * @param {Object} props.chat - The chat message object.
 * @param {number} props.chat.id - The unique identifier of the chat message.
 * @param {number} props.chat.sender_id - The ID of the sender of the message.
 * @param {string} props.chat.message - The content of the message.
 * @param {number} props.chat.unanswered - Whether the chatbot was not able to reply (if applicable).
 * @param {( 0 | -1 | null)} props.chat.vote - The vote information (if applicable).
 * @param {( 0 | 1 )} props.chat.is_corrected - Is the answer Corrected.
 * @param {number} props.chat.chat_id - The ID of the chat associated with the message.
 * @param {string} props.chat.created_at - The timestamp when the message was created.
 * @param {string} props.chat.updated_at - The timestamp when the message was last updated.
 * @param {Object} props.chat.sender - Information about the sender.
 * @param {number} props.chat.sender.id - The unique identifier of the sender.
 * @param {string} props.chat.sender.name - The name of the sender.
 * @param {string} props.chat.sender.email - The email of the sender.
 * @param {string} props.chat.sender.phone - The contact of the sender (if available).
 * @param {string} props.chat.sender.ip_address - The IP address of the sender (if available).
 * @param {string} props.chat.sender.email_verified_at - The timestamp when the sender's email was verified (if available).
 * @param {string} props.chat.sender.created_at - The timestamp when the sender's account was created (if available).
 * @param {string} props.chat.sender.updated_at - The timestamp when the sender's account was last updated (if available).
 * @returns {JSX.Element} A React component that renders the chat message.
 */
const ChatBox = ({
	chat: { fullMessage, ...chat },
	isLastMessage,
	getUserChats,
	lastTextMessage,
	linkPreview = false,
	whatsappChat = false,
}) => {
	
	const { Post, trackOnDashboard } = useApiCall();
	const {
		chatConfig: { themeBackground, themeColor, chatBackground, chatColor },
	} = useChatConfigContext();

	const markdownMessage = useMemo(
		() => (linkPreview ? chat.message : convertLinksToMarkdown(chat.message)),
		[chat.message, linkPreview]
	);

	const messageRef = useRef(null);
	const [reviews, setReviews] = useState(chat?.reviews ?? []);
    const [reviewBox, setReviewBox] = useState(false)
	const [isEditResponseOpen, setIsEditResponseOpen] = useState(false);
	const [isRefreshResponseOpen, setIsRefreshResponseOpen] = useState(false);
	const [linkPreviewError, setLinkPreviewError] = useState(false);
	const [message, setMessage] = useState(fullMessage);
	const isError =
		message === "I'm sorry, but it seems like something went wrong.";
	const [editedMessage, setEditedMessage] = useState(fullMessage);
	const [isEdited, setIsEdited] = useState(Boolean(chat.is_corrected));
	const [loading, setLoading] = useState(false);

	const action = useMemo(
		() =>
			chat?.action
				? {
						...chat.action,
						detail: chat?.action?.detail
							? JSON.parse(chat?.action?.detail)
							: undefined,
					}
				: {},
		[chat?.action]
	);

	const params = new URLSearchParams(window.location.search);
	const message_id = Number(params.get("message_id"));

	const isChatBot = chat.role_id === ORG_BOT_ID;
	const isUser = chat.role_id === ORG_END_USER_ID;
	const isAgent = !isChatBot && !isUser;
	useEffect(() => {
		try {
			if (message_id === Number(chat.id))
				messageRef.current.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
		} catch (error) {
			console.error(error);
		}
	}, [chat.id, message_id]);

	const toggleEditResponse = () => {
		try {
			trackOnDashboard({ message: "Edit Response Clicked" });
			trackGAEvent({
				action: "edit_response",
				category: "User Actions",
				label: "Edit Response Button",
				value: 1,
				// user: user,
				// organization: organization,
			});
		} catch (error) {
			console.error(error);
		}
		setIsEditResponseOpen(true);
	};
	const toggleRefreshResponse = () => {
		setIsRefreshResponseOpen((prev) => !prev);
	};

	const handleAddCorrection = async () => {
		try {
			if (loading) return;
			setLoading(true);
			await Post(1, "submit_correction", {
				message: editedMessage,
				message_id: parseInt(chat.id),
			});
			setLoading(false);
			getUserChats(true);
			handleClose(true);

			// console.log(res.data.message,res.data.status_code);
		} catch (error) {
			console.error(error);
			toast.error("something went wrong");
			setLoading(false);
		}
	};
	async function handleClose(submit = false) {
		if (submit === true) {
			setMessage(editedMessage);
			setIsEdited(true);
			toast.success("Message Updated");
		}
		setIsEditResponseOpen(false);
	}
	if (linkPreviewError) return <></>;
	return (
		<>
			<div
				ref={messageRef}
				aria-label={`${isChatBot ? "AI" : "USER"}: ${chat.message}`}
				className={classNames(
					styles.chatBoxContainer,
					{ [styles.userChat]: isUser },
					{ [styles.beyondChat]: !isUser }
				)}
			>
				{lastTextMessage && isChatBot && (
					<>
						<IconButton
							className={styles.btn}
							// classes={{ root: classes.btnRoot }}
							disableRipple={true}
							disableFocusRipple={true}
							onClick={toggleEditResponse}
							size="large"
						>
							<Tooltip title="Change Response if it seems incorrect" arrow>
								<EditIcon />
							</Tooltip>
						</IconButton>
			
					</>
				)}
				<div
					className={classNames(styles.chatBox, {
						[styles.highlighted]: chat.id === message_id,
						[styles.whatsapp]: whatsappChat,
					})}
					id={`message-${chat.id}`}
					style={{
						backgroundColor: isError
							? "#ff3333"
							: isUser
								? themeBackground
								: chatBackground,
						color: isUser ? themeColor : chatColor,
					}}
				>
					{linkPreview ? (
						<LinkPreview
							message={markdownMessage}
							setLinkPreviewError={setLinkPreviewError}
						/>
					) : (
						<Markdown
							components={{ p: "span" }}
							linkTarget="_blank"
							rehypePlugins={[rehypeRaw]}
						>
							{markdownMessage}
						</Markdown>
					)}
					{lastTextMessage && action?.name ? (
						<BusinessAction action={action} />
					) : (
						<></>
					)}
					{isChatBot && lastTextMessage ? (
						<AttrArea vote={chat?.vote} corrected={isEdited} chat={chat} />
					) : null}
				</div>
			</div>
			{isChatBot && isLastMessage && reviews?.length ? (
				<Suspense fallback={<></>}>
					<MessageReviews setReviewBox={(val)=>setReviewBox(val)} reviews={reviews} setReviews={setReviews} />
				</Suspense>
			) : null}
			{isChatBot && isLastMessage ? (
				<Suspense fallback={<></>}>
					<AddMessageReview
					    reviewBox={reviewBox}
						setReviewBox={(val)=>setReviewBox(val)}
						reviews={reviews}
						message_id={chat.id}
						setReviews={setReviews}
					/>
				</Suspense>
			) : null}
			<MuiDialog
				open={isEditResponseOpen}
				title="Edit Message"
				onClose={handleClose}
				onSubmit={handleAddCorrection}
				submitDisabled={message === editedMessage || loading}
			>
				<Typography variant="subtitle1">Original AI answer</Typography>
				<TextField multiline disabled value={message} fullWidth />
				<br />
				<br />
				<Typography variant="subtitle1">Corrected Answer</Typography>
				<TextField
					multiline
					placeholder="Add Your New Message here"
					value={editedMessage}
					onChange={(e) => setEditedMessage(e.target.value)}
					fullWidth
				/>
			</MuiDialog>
			<Suspense fallback={isRefreshResponseOpen ? <DialogLoader /> : <></>}>
				{isRefreshResponseOpen ? (
					<RefreshResponseDialog
						open={isRefreshResponseOpen}
						onClose={toggleRefreshResponse}
						originalMessage={message}
						message_id={Number(chat.id)}
					/>
				) : null}
			</Suspense>
		</>
	);
};

const AttrArea = ({ vote, corrected, chat }) => {
	const history = useHistory();
	const location = useLocation();
	const searchParams = useMemo(
		() => new URLSearchParams(location.search),
		[location.search]
	);
	const isAnswerSourceOpen =
		searchParams.get("show_answer_source") === String(chat.id);

	const toggleShowMessageRefs = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("show_answer_source", chat.id);
		history.push({
			pathname: url.pathname,
			search: url.search,
		});
	};
	return (
		<div className={styles.attrArea} style={{ display: "flex" }}>
			{chat?.user_actions?.value === BUSINESS_ACTION_CLICK
				? "User Clicked on Business Action - "
				: null}
			{format(new Date(chat.created_at), "LLL dd, hh:mm aaa")}
			{vote === UPVOTE ? (
				<Tooltip disableFocusListener title="User upvoted this response">
					<div className={styles.attr}>
						<ThumbUpAltIcon color="primary" fontSize="small" />
					</div>
				</Tooltip>
			) : vote === DOWNVOTE ? (
				<Tooltip disableFocusListener title="User downvoted this response">
					<div className={styles.attr}>
						<ThumbDownAltIcon color="secondary" fontSize="small" />
					</div>
				</Tooltip>
			) : null}

			{corrected ? (
				<Tooltip
					disableFocusListener
					title="This response was corrected by You."
				>
					<div className={styles.attr}>
						<SpellcheckIcon fontSize="small" />
					</div>
				</Tooltip>
			) : null}
			<IconButton
				size="small"
				color="inherit"
				aria-label="close"
				component="button"
				onClick={toggleShowMessageRefs}
			>
				<Tooltip disableFocusListener title="Show source of this response">
					<Info
						color={isAnswerSourceOpen ? "primary" : undefined}
						fontSize="small"
					/>
				</Tooltip>
			</IconButton>
		</div>
	);
};
export default withErrorBoundary(ChatBox, "ChatBox");
