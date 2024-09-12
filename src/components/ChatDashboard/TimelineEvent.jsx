import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Chip, Collapse } from "@mui/material";
import {
	ACTION_BUTTON_CLICKED,
	AGENT_JOINED,
	AGENT_LEFT,
	PAGE_SWITCHED,
	SUGGESTED_QUESTION_CLICKED,
	USER_CLOSED_CHATBOT,
	USER_OPENED_CHATBOT,
} from "components/common/constants";
import React, { useMemo, useState } from "react";

const TimelineEvent = ({ event }) => {
	const timelineEvent = useMemo(() => {
		switch (event.event_id) {
			case SUGGESTED_QUESTION_CLICKED:
				return event.suggested_question_clicked.map((_) => ({
					message: `User Clicked a Suggested Question`,
					event_id: event.event_id,
				}));
			case ACTION_BUTTON_CLICKED:
				return event.actions.map((_) => ({
					message: `User Clicked the Business Action`,
					event_id: event.event_id,
				}));
			case AGENT_JOINED:
				return event.agents.map((agent) => ({
					message: `${agent.name} Joined Chat`,
					event_id: event.event_id,
				}));
			case AGENT_LEFT:
				return event.agents.map((agent) => ({
					message: `${agent.name} Left Chat`,
					event_id: event.event_id,
				}));
			case USER_CLOSED_CHATBOT:
				return event.user_chatbot_events.map((_) => ({
					message: `User Closed Chatbot`,
					event_id: event.event_id,
				}));
			case USER_OPENED_CHATBOT:
				return event.user_chatbot_events.map((_) => ({
					message: `User Opened Chatbot`,
					event_id: event.event_id,
				}));
			case PAGE_SWITCHED:
				return event.user_urls.map((url) => {
					try {
						const pageUrl = new URL(url.page_url);
						return {
							message: `User Switched to ${pageUrl.origin}${pageUrl.pathname}`,
							event_id: event.event_id,
							url: url.page_url,
						};
					} catch (error) {
						return {
							message: `User Switched to ${url.page_url}`,
							event_id: event.event_id,
							url: url.page_url,
						};
					}
				});

			default:
				return [];
		}
	}, [event.event_id]);

	const [expanded, setExpanded] = useState(timelineEvent.length <= 1);
	return (
		<>
			{timelineEvent.length > 1 && event.event_id === PAGE_SWITCHED ? (
				<div style={{ display: "flex", justifyContent: "center" }}>
					<Chip
						sx={{
							height: "auto",
							"& .MuiChip-label": {
								display: "block",
								whiteSpace: "normal",
							},
						}}
						label={`User Switched Pages ${timelineEvent.length} Times`}
						variant="outlined"
						color="info"
						size="small"
						deleteIcon={expanded ? <ExpandLess /> : <ExpandMore />}
						onDelete={() => setExpanded((prev) => !prev)}
					/>
				</div>
			) : (
				<></>
			)}

			{timelineEvent.map((event) => (
				<div
					key={event.message + event.id}
					style={{
						display: expanded ? "flex" : "none",
						justifyContent: "center",
					}}
				>
					<Collapse in={expanded}>
						<Chip
							sx={{
								height: "auto",
								"& .MuiChip-label": {
									display: "block",
									whiteSpace: "normal",
								},
							}}
							label={event.message}
							variant="outlined"
							color="info"
							size="small"
							{...(event.event_id === PAGE_SWITCHED
								? {
										component: "a",
										href: event.url,
										target: "_blank",
										sx: { cursor: "pointer" },
									}
								: {})}
						/>
					</Collapse>
				</div>
			))}
		</>
	);
};

export default TimelineEvent;
