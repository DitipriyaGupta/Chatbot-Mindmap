import React, { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useApiCall } from "components/common/appHooks";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import MuiDialog from "components/common/MuiDialog";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import ReactDiffViewer from "react-diff-viewer";

const RefreshResponseDialog = ({
	open,
	onClose,
	originalMessage,
	message_id,
}) => {
	const axiosCancelSource = axios.CancelToken.source();
	const { Post } = useApiCall();
	const textLoaders = useMemo(
		() => [
			"Hmm, that's a tough one",
			"Let me think about that",
			"Interesting question",
			"Give me a second",
			"I’m pondering that right now",
			"Let me see what I can find",
			"Thinking it through",
			"That's a great question",
			"Let me give that some thought",
			"Hold on, let me check",
		],
		[]
	);
	const [loading, setLoading] = useState(true);
	const [refreshedResponse, setRefreshedResponse] = useState(textLoaders[0]);
	const [dotCount, setDotCount] = useState(1);

	useEffect(() => {
		if (loading) {
			const getRandomText = () => {
				const randomIndex = Math.floor(Math.random() * textLoaders.length);
				return textLoaders[randomIndex];
			};

			// Initial random text
			setRefreshedResponse(getRandomText());

			// Update text every 3 seconds
			const textInterval = setInterval(() => {
				setRefreshedResponse(getRandomText());
			}, 4 * 1000);

			// Cleanup interval on component unmount
			const dotInterval = setInterval(() => {
				setDotCount((prevCount) => (prevCount % 3) + 1);
			}, 500);
			// Cleanup interval on component unmount
			return () => {
				clearInterval(dotInterval);
				clearInterval(textInterval);
			};
		}
	}, [loading]);

	async function refreshResponse() {
		try {
			setLoading(true);
			const response = await Post(
				1,
				"refresh_chat",
				{ message_id },
				axiosCancelSource.token
			);
			setRefreshedResponse(response.data.data.message.join("\n"));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (open) refreshResponse();

		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [open]);

	return (
		<MuiDialog
			open={open}
			title="Refresh Message"
			onClose={onClose}
			disableButtons
			width="1000px"
		>
			{loading ? (
				<Typography align="center" variant="h3">
					{refreshedResponse + ".".repeat(dotCount)}
				</Typography>
			) : (
				<ReactDiffViewer
					oldValue={originalMessage}
					newValue={refreshedResponse}
					splitView={true}
					// compareMethod={DiffMethod.WORDS}
					hideLineNumbers
					showDiffOnly={false}
					leftTitle="Original Message"
					rightTitle="New Message"
				/>
			)}
		</MuiDialog>
	);
};

export default withErrorBoundary(
	RefreshResponseDialog,
	"RefreshResponseDialog"
);
