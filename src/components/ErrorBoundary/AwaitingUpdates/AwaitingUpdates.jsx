import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect } from "react";
import styles from "./AwaitingUpdates.module.css";
import server_update from "assets/images/server_update.png";
import { Button, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const AwaitingUpdates = () => {
	// const images = [image1, image2, image3];
	useEffect(() => {
		const interval = setInterval(() => {
			window.location.reload();
		}, 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className={styles.container}>
			<img
				src={server_update}
				alt="Awaiting Updates"
				className={styles.image}
			/>
			<Typography variant="h2" component="h2" className={styles.title}>
				Awaiting Updates
			</Typography>
			<Typography variant="body2" component="p" className={styles.text}>
				An update is in progress. It will take a few minutes to complete. <br />
				Page will automatically reload every 30 seconds. <br /> <br />
				You can also click the button below to refresh the page.
			</Typography>
			<Button
				variant="contained"
				color="primary"
				className={styles.button}
				onClick={() => window.location.reload()}
				disableElevation
				startIcon={<Refresh />}
			>
				Refresh
			</Button>
		</div>
	);
};
export default withErrorBoundary(AwaitingUpdates, "AwaitingUpdates");
