import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import styles from "./EditConfig.module.css";
import TextField from "@mui/material/TextField";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Avatar,
	Button,
	Typography,
} from "@mui/material";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { toast } from "react-toastify";
import baseDomain from "components/common/baseDomain";
import { useChatConfigContext } from "../ChatConfigContext/ChatConfigContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/styles";

import ColorBox from "./ColorBox/ColorBox";
import PositionBox from "./Position/Position";
import AdvanceBox from "./AdvanceBox/AdvanceBox";
import WelcomeText from "./WelcomeText/WelcomeText";
import BusinessActions from "./BusinessActions/BusinessActions";
import { useOrgContext } from "context/OrgContext";
import { useUserContext } from "context/UserContext";
import { useHistory } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	position: "absolute",
	bottom: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});

const EditConfig = () => {
	const {
		org: { host_url },
		isDemo,
	} = useOrgContext();
	const {
		user: { is_god },
	} = useUserContext();
	const history = useHistory();
	const {
		setChatConfig,
		handleChatConfigReset,
		chatConfig,
		submitChatConfig,
		isModified,
	} = useChatConfigContext();

	async function handleCopySourceCode() {
		navigator.clipboard.writeText(
			`<script src="${
				baseDomain.integrationRoute
			}/chat-widget?orgId=${decodeURIComponent(host_url)}"></script>`
		);
		toast.success("Copied source code to clipboard");
	}

	return (
		<div className={styles.configBox}>
			<div className={styles.stickyHeader}>
				<Button
					variant="outlined"
					color="primary"
					// disableElevation
					size="medium"
					startIcon={<ClearAllIcon />}
					onClick={handleChatConfigReset}
				>
					Reset to Default
				</Button>
				<Button
					variant="contained"
					color="primary"
					// disableElevation
					disabled={!isModified}
					size="medium"
					onClick={submitChatConfig}
				>
					Save changes
				</Button>
			</div>
			<CommonAccordion title="Basic" subtitle="Edit Name and Logo">
				<TextField
					label="Name"
					name="Name"
					value={chatConfig.title}
					onChange={(e) => setChatConfig({ title: e.target.value })}
					required
				/>
				<Avatar
					src={
						chatConfig.avatar && typeof chatConfig.avatar === "object"
							? URL.createObjectURL(chatConfig.avatar)
							: chatConfig.avatar
					}
					sx={{ width: 56, height: 56, margin: "auto" }}
					alt={chatConfig.title}
				/>
				<Button
					component="label"
					variant="outlined"
					startIcon={<CloudUploadIcon />}
				>
					Select New Avatar
					<VisuallyHiddenInput
						type="file"
						accept=".jpeg,.png,.jpg,.gif,.webp"
						onChange={async (e) => {
							const { default: Compressor } = await import("compressorjs");
							new Compressor(e.target.files[0], {
								quality: 1,
								maxWidth: 100,
								success: (avatar) => {
									setChatConfig({
										avatar: new File([avatar], e.target.files[0].name),
									});
								},
							});
						}}
					/>
				</Button>
			</CommonAccordion>
			{isDemo && !is_god ? null : (
				<CommonAccordion
					title="Business Actions"
					subtitle="Set Call-To-Actions of your business"
				>
					<BusinessActions />
				</CommonAccordion>
			)}

			<CommonAccordion
				title="Welcome Message"
				subtitle="The First message a user sees"
			>
				<WelcomeText />
			</CommonAccordion>

			<CommonAccordion
				title="Design"
				subtitle="Customize the appearance of the chat bot"
			>
				<ColorBox />
			</CommonAccordion>

			<CommonAccordion
				title="Position"
				subtitle="Where the chatbot will appear on your website"
			>
				<PositionBox />
			</CommonAccordion>

			<CommonAccordion title="Ground Truths" subtitle="Add most asked Q&As">
				<Typography>Ground Truths has been Moved to Mind Map</Typography>
				<Button
					onClick={() =>
						history.push(`/${encodeURIComponent(host_url)}/mind-map`)
					}
				>
					Take Me There
				</Button>
			</CommonAccordion>

			<CommonAccordion
				title="Advanced"
				subtitle="Enable user signup, Mail notification"
			>
				<AdvanceBox />
			</CommonAccordion>

			<CommonAccordion title="Copy Code" subtitle="Setup on your website">
				<div className={styles.actionBox}>
					<Button
						variant="outlined"
						color="primary"
						disableElevation
						size="medium"
						startIcon={<FileCopyIcon />}
						onClick={handleCopySourceCode}
					>
						Copy Source code
					</Button>
				</div>
				<Typography variant="subtitle2">
					You can read more about setting up BeyondChats on your website{" "}
					<a
						href="https://beyondchats-docs.netlify.app/"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "blue", textDecoration: "underline" }}
					>
						here
					</a>
					.
				</Typography>
			</CommonAccordion>
		</div>
	);
};

export default withErrorBoundary(EditConfig, "EditConfig");

const CommonAccordion = ({ title, subtitle, children }) => {
	return (
		<Accordion>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography sx={{ width: "33%", flexShrink: 0 }}>{title}</Typography>
				<Typography sx={{ color: "text.secondary" }}>{subtitle}</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 3,
					padding: "20px",
					borderTop: "1px solid",
					borderTopColor: "secondary.light",
				}}
			>
				{children}
			</AccordionDetails>
		</Accordion>
	);
};
