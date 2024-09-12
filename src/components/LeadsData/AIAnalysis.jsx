import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Tooltip } from "@mui/material";
import JSONToHTML from "components/common/JSONToHTML";
import { SmallLoader } from "components/common/NewLoader";
import { useApiCall } from "components/common/appHooks.js";
import React, { useState } from "react";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
	tooltip: {
		backgroundColor: "white",
		fontSize: 15,
		color: "black",
		// boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
		boxShadow:
			"rgba(0, 0, 0, 0.35) 0px 0px 0px 1px, rgba(0, 0, 0, 0.35) 0px 5px 15px",
		width: "100%",
		maxWidth: "700px",
		borderRadius: 8,
		padding: 15,
	},
	arrow: {
		"&:before": {
			boxShadow:
				"rgba(0, 0, 0, 0.35) 0px 0px 0px 1px, rgba(0, 0, 0, 0.35) 0px 5px 15px",
		},
		color: "white",
	},
}));

export function removeKeysWithNAValue(obj) {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === "N/A") {
			delete obj[key];
		} else if (
			typeof obj[key] === "object" &&
			!Array.isArray(obj[key]) &&
			obj[key] !== null
		) {
			removeKeysWithNAValue(obj[key]);
		} else if (Array.isArray(obj[key])) {
			obj[key].forEach((item) => {
				if (typeof item === "object" && item !== null) {
					removeKeysWithNAValue(item);
				}
			});
		}
	});
	return obj;
}
const AIAnalysis = ({ chatId, disabled, updateAnalysis }) => {
	const { Get } = useApiCall();
	const classes = useStyles();
	const [aiAnalysis, setAiAnalysis] = useState();
	const [analysisLoading, setAnalysisLoading] = useState(true);

	async function getAIAnalysis(chat_id) {
		if (aiAnalysis || disabled) return;
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

	return (
		<>
			<Tooltip
				// placement="left"
				leaveDelay={350}
				onOpen={() => getAIAnalysis(chatId)}
				onClose={() => {
					if (aiAnalysis?.lead_score) {
						updateAnalysis(chatId, aiAnalysis?.lead_score);
					}
				}}
				classes={{
					tooltip: classes.tooltip,
					arrow: classes.arrow,
				}}
				title={
					disabled ? (
						"No Chats to Analyze"
					) : analysisLoading ? (
						<SmallLoader width="300px" />
					) : aiAnalysis ? (
						<JSONToHTML data={aiAnalysis} />
					) : (
						<>Data not Available</>
					)
				}
			>
				<AdsClickIcon color={disabled ? "disabled" : "primary"} />
			</Tooltip>
		</>
	);
};

export default withErrorBoundary(AIAnalysis, "AIAnalysis");
