import {
	ACTION_BUTTON,
	ACTION_MCQ,
	ACTION_TEXT_INPUT,
} from "components/common/constants";
import { useChatConfigContext } from "components/Config/ChatConfigContext/ChatConfigContext";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import React from "react";

const BusinessAction = ({ action = {} }) => {
	const {
		chatConfig: { themeBackground, themeColor },
	} = useChatConfigContext();
	return action?.type === ACTION_BUTTON ? (
		<>
			<br />
			<a
				href={action?.detail?.link}
				target="_blank"
				rel="noreferrer"
				style={{
					appearance: "none",
					backgroundColor: themeBackground,
					borderRadius: "6px",
					boxSizing: "border-box",
					color: themeColor,
					cursor: "pointer",
					display: "inline-block",
					fontFamily:
						'Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
					fontSize: "16px",
					fontWeight: "600",
					lineHeight: "normal",
					margin: "0",
					minHeight: "20px",
					minWidth: "0",
					outline: "none",
					padding: "8px 24px",
					textAlign: "center",
					textDecoration: "none",
					transition: "all 300ms cubic-bezier(.23, 1, 0.32, 1)",
					userSelect: "none",
					WebkitUserSelect: "none",
					touchAction: "manipulation",
					width: "100%",
					willChange: "transform",
				}}
			>
				{action?.name}
			</a>
		</>
	) : // TODO: handle actions
	action?.type === ACTION_MCQ ? (
		<></>
	) : action?.type === ACTION_TEXT_INPUT ? (
		<></>
	) : (
		<></>
	);
};

export default withErrorBoundary(BusinessAction, "BusinessAction");
