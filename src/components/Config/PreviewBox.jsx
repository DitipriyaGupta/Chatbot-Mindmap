import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Button, IconButton, TextField } from "@mui/material";
import React, { useEffect, useRef } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { ArrowForward } from "@mui/icons-material";
import baseDomain from "components/common/baseDomain";
import { useOrgContext } from "context/OrgContext";

const useStyles = makeStyles((theme) => ({
	root: {
		marginLeft: theme.spacing(1),
		flex: 1,
		fontSize: "0.82rem",
		padding: "6px 12px",
	},
	iconButton: {
		padding: "4px !important",
	},
}));

const PreviewBox = () => {
	const classes = useStyles();
	const {
		org: { host_url, data_link },
	} = useOrgContext();

	const [url, setUrl] = React.useState(
		data_link
			? "https://" + (data_link ?? host_url)
			: "https://beyondchats.com/"
	);
	const [showSite, setShowSite] = React.useState(true);
	const iframeContainerRef = useRef(null);

	useEffect(() => {
		const element = iframeContainerRef.current;
		const script = document.createElement("script");
		script.src = `${
			baseDomain.integrationRoute
		}/chat-widget?orgId=${localStorage.getItem("host_url")}`;
		script.async = true;

		// Append the script to the document's body
		element.appendChild(script);

		// Clean up function to remove the script when component unmounts
		return () => {
			console.log("removed");
			try {
				const links = document.querySelectorAll('link[rel="stylesheet"]');

				for (let i = 0; i < links.length; i++) {
					const link = links[i];
					if (
						link.href &&
						link.href.indexOf(baseDomain.integrationRoute) !== -1
					) {
						link.parentNode.removeChild(link);
					}
				}
			} catch (error) {
				console.error(error);
			}
			// Remove the script element from the element's
			try {
				element.removeChild(document.getElementById("beyond-chats-widget"));
			} catch (error) {
				console.error(error);
			}
			try {
				element.removeChild(script);
			} catch (error) {
				console.error(error);
			}
		};
	}, []);

	return (
		<div className="beyond-chats-widget-container">
			<div
				className="wc-header"
				style={{
					display: showSite ? "flex" : "none",
				}}
			>
				<TextField
					className={classes.input}
					disableunderline="true"
					classes={{
						root: classes.root,
					}}
					value={url}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setUrl(e.target.value);
						}
					}}
					onChange={(e) => {
						setUrl(e.target.value);
					}}
					InputProps={{
						endAdornment: (
							<IconButton
								classes={{
									root: classes.iconButton,
								}}
								onClick={() => setUrl(url)}
								size="large"
							>
								<ArrowForward style={{ color: "#ccc", fontSize: "1.2rem" }} />
							</IconButton>
						),
					}}
					placeholder="Enter your website URL"
				/>
				<div className="wc-box">
					<div className="minimize"></div>
					<div className="maximize"></div>
					<div className="close" onClick={() => setShowSite(!showSite)}></div>
				</div>
			</div>
			<div
				className="wc-body"
				ref={iframeContainerRef}
				style={{ position: "relative" }}
			>
				{!showSite && (
					<div className="wc-open-preview">
						<Button
							variant="contained"
							color="primary"
							className="wc-btn"
							onClick={() => setShowSite(!showSite)}
						>
							Open Preview
						</Button>
					</div>
				)}
				<iframe
					src={url}
					style={{
						display: showSite ? "flex" : "none",
					}}
					title="chat"
					className="wc-iframe"
					id="wc-iframe"
				></iframe>
			</div>
			<div
				id="beyond-chats-widget"
				className="beyond-chats-widget"
				data-orgid={decodeURIComponent(host_url)}
			></div>
		</div>
	);
};

export default withErrorBoundary(PreviewBox, "PreviewBox");
