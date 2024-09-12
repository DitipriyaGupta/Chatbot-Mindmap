import React, { Fragment, useState } from "react";
import {
	Box,
	Typography,
	IconButton,
	Tooltip,
	Button,
	Chip,
} from "@mui/material";
import {
	Email,
	Phone as PhoneIcon,
	WhatsApp as WhatsAppIcon,
	QuestionAnswer,
	KeyboardArrowDown,
	LocationOn,
	AutoGraph,
} from "@mui/icons-material";
import { useOrgContext } from "context/OrgContext";
import { makeStyles } from "@mui/styles";
import JSONToHTML from "components/common/JSONToHTML";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { Link } from "react-router-dom";
import { removeKeysWithNAValue } from "./AIAnalysis";
import {
	LEAD_SCORE_HIGH,
	LEAD_SCORE_MEDIUM,
} from "components/common/constants";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import { SmallLoader } from "components/common/NewLoader";
import { useApiCall } from "components/common/appHooks";

const useStyles = makeStyles((theme) => ({
	info_line: {
		display: "flex",
		alignItems: "center",
		gap: "0.36rem",
	},
	info_line_icon: {
		fontSize: "0.95rem",
		color: "#666",
	},
	info_sub_container: {
		display: "flex",
		flexDirection: "column",
		gap: "0.36rem",
	},
}));

const Lead = ({ lead, key, updateAnalysis }) => {
	const classes = useStyles();
	const { Get } = useApiCall();
	const { org } = useOrgContext();
	const [isExpanded, setIsExpanded] = useState(false);
	const [aiAnalysis, setAiAnalysis] = useState();
	const [analysisLoading, setAnalysisLoading] = useState(false);

	async function getAIAnalysis(chat_id) {
		if (aiAnalysis || lead.msg_count === 0) return;
		try {
			setAnalysisLoading(true);
			setIsExpanded(true);
			const response = await Get(1, "get_ai_leads_analysis", { chat_id });
			setAiAnalysis(removeKeysWithNAValue(response.data.data));
			if (response.data.data.lead_score) {
				updateAnalysis(chat_id, response.data.data.lead_score);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setAnalysisLoading(false);
		}
	}

	return (
		<Box
			key={key}
			sx={{
				display: "flex",
				flexDirection: "column",
				padding: "10px",
				borderRadius: "8px",
				border: "1px solid #e0e0e0",
				marginBottom: "10px",
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box className={classes.info_sub_container}>
					<Typography variant="h2">
						{lead.creator.name ?? "-"}{" "}
						{lead.lead_score ? (
							<Chip
								label={lead.lead_score}
								color="success"
								size="small"
								icon={<SentimentSatisfiedAltIcon />}
								{...{
									color:
										lead.lead_score === LEAD_SCORE_HIGH
											? "success"
											: lead.lead_score === LEAD_SCORE_MEDIUM
												? "warning"
												: "error",
									icon:
										lead.lead_score === LEAD_SCORE_HIGH ? (
											<SentimentSatisfiedAltIcon />
										) : lead.lead_score === LEAD_SCORE_MEDIUM ? (
											<SentimentSatisfiedIcon />
										) : (
											<SentimentNeutralIcon />
										),
								}}
							/>
						) : null}
					</Typography>
					<Box className={classes.info_line}>
						<LocationOn className={classes.info_line_icon} />
						<Typography sx={{ fontSize: "0.95rem", color: "#666" }}>{`${
							lead.creator.city ?? "-"
						}, ${lead.creator?.country?.name ?? "-"}`}</Typography>
					</Box>
					{/* {lead.lead_score ? (
						<Box className={classes.info_line}>
							<Chip
								label={lead.lead_score}
                color="success"
                size="small"
								icon={<SentimentSatisfiedAltIcon />}
								{...{
									color:
										lead.lead_score === LEAD_SCORE_HIGH
											? "success"
											: lead.lead_score === LEAD_SCORE_MEDIUM
												? "warning"
												: "error",
									icon:
										lead.lead_score === LEAD_SCORE_HIGH ? (
											<SentimentSatisfiedAltIcon />
										) : lead.lead_score === LEAD_SCORE_MEDIUM ? (
											<SentimentSatisfiedIcon />
										) : (
											<SentimentNeutralIcon />
										),
								}}
							/>
						</Box>
					) : null} */}
				</Box>
				<Box
					className={classes.info_sub_container}
					style={{ alignItems: "flex-end" }}
				>
					<Box className={classes.info_line}>
						<DateRangeIcon className={classes.info_line_icon} />
						<Typography sx={{ fontSize: "0.95rem", color: "#666" }}>
							{new Intl.DateTimeFormat("en-US", {
								dateStyle: "short",
							}).format(new Date(lead.created_at))}
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					marginTop: "0.82rem",
					gap: "0.5rem",
				}}
			>
				{lead?.creator?.email && (
					<Tooltip title="Send Email">
						<IconButton
							onClick={() =>
								window.open(`mailto:${lead.creator.email}`, "_self")
							}
							disabled={!lead.creator.email}
						>
							<Email color="primary" />
						</IconButton>
					</Tooltip>
				)}
				{lead?.creator?.phone && (
					<Fragment>
						<Tooltip title="Open on Whatsapp">
							<IconButton
								onClick={() => {
									window.open(
										`https://wa.me/${lead.creator?.country?.phone_code ?? ""}${
											lead.creator.phone
										}`,
										"_blank"
									);
								}}
							>
								<WhatsAppIcon sx={{ color: "#25D366" }} />
							</IconButton>
						</Tooltip>
						<Tooltip title="Call">
							<IconButton
								onClick={() =>
									window.open(`tel:${lead.creator.phone}`, "_self")
								}
								disabled={!lead.creator.phone}
							>
								<PhoneIcon color="primary" />
							</IconButton>
						</Tooltip>
					</Fragment>
				)}
				{lead?.msg_count > 0 && (
					<Tooltip title="View Messages">
						<Link to={`/${org.host_url}/${lead.chat_id}`}>
							<IconButton>
								<QuestionAnswer color="primary" />
							</IconButton>
						</Link>
					</Tooltip>
				)}
				{lead?.msg_count > 0 && (
					<Tooltip title="View AI Analysis">
						<IconButton onClick={() => getAIAnalysis(lead.chat_id)}>
							<AutoGraph color="primary" />
						</IconButton>
					</Tooltip>
				)}
				<Tooltip title="View More">
					<IconButton onClick={() => setIsExpanded((prev) => !prev)}>
						<KeyboardArrowDown
							color="primary"
							sx={{
								transition: "transform 0.3s",
								transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
							}}
						/>
					</IconButton>
				</Tooltip>
			</Box>
			<Box
				sx={{
					display: isExpanded ? "flex" : "none",
					flexDirection: "column",
					gap: "0.5rem",
					marginTop: "0.5rem",
				}}
			>
				<Box
					className={classes.info_line}
					style={{ display: lead.creator.email ? "flex" : "none" }}
				>
					<Email className={classes.info_line_icon} />
					<Typography sx={{ fontSize: "0.95rem", color: "#666" }}>
						{lead.creator.email}
					</Typography>
				</Box>
				<Box
					className={classes.info_line}
					style={{ display: lead.creator.phone ? "flex" : "none" }}
				>
					<PhoneIcon className={classes.info_line_icon} />
					<Typography sx={{ fontSize: "0.95rem", color: "#666" }}>
						{lead.creator.phone}
					</Typography>
				</Box>
				<hr
					style={{
						width: "100%",
						margin: "0.5rem 0",
						border: "0.5px solid #e0e0e0",
						display: lead.msg_count > 0 ? "block" : "none",
					}}
				/>
				<Box
					className={classes.info_sub_container}
					sx={{
						alignItems: "center",
						display: lead.msg_count > 0 ? "flex" : "none !important",
					}}
				>
					{aiAnalysis && <JSONToHTML data={aiAnalysis} />}
					{analysisLoading && <SmallLoader />}
					{!aiAnalysis && !analysisLoading && (
						<Button
							variant="outlined"
							color="primary"
							size="small"
							onClick={() => getAIAnalysis(lead.chat_id)}
							startIcon={<AutoGraph color="primary" />}
						>
							Get AI Insights
						</Button>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default Lead;
