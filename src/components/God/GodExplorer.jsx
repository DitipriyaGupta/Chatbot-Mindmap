import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
	container: {
		display: "flex",
		width: "100%",
		flexDirection: "column",
		// height: "100%",
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		gap: 30,
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: "12px",
	},
}));

const GodExplorer = () => {
	const classes = useStyles();
	const options = useMemo(
		() => [
			{
				name: "Create New Organization",
				path: "god/create-new-organization",
			},
			{
				name: "Edit Organization Details",
				path: "god/edit-organization-details",
			},
			{
				name: "Delete Organization",
				path: "god/delete-organization",
				props: {
					color: "secondary",
				},
			},
			{
				name: "Clear Organization's Chats",
				path: "god/clear-organizations-chats",
				props: {
					color: "secondary",
				},
			},
			{
				name: "Duplicate Organization",
				path: "god/duplicate-organization",
			},
			{
				name: "Sync Vectors",
				path: "god/sync-vectors",
			},
			{
				name: "Sync Vectors for all Orgs",
				path: "god/sync-all-vectors",
			},
			{
				name: "Message Sandbox",
				path: "god/message-sandbox",
			},
			{
				name: "Laravel Telescope",
				path: "god/telescope",
			},
			{
				name: "Add New Role",
				path: "god/add-role",
				props: {
					disabled: true,
				},
			},
		],
		[]
	);

	return (
		<div className={classes.container}>
			<Typography
				variant="h3"
				style={{
					textAlign: "center",
				}}
			>
				What divine activities do you wish to engage in this day?
			</Typography>
			<div className={classes.content}>
				{options?.map((option) => {
					return (
						<Button
							component={Link}
							key={option.name}
							className={classes.org}
							variant="outlined"
							color="primary"
							to={option.path}
							{...option.props}
						>
							{option.name}
						</Button>
					);
				})}
			</div>
		</div>
	);
};

export default withErrorBoundary(GodExplorer, "GodExplorer");
