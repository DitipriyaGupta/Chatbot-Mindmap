import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import styles from "./Error.module.css";
import lost_img from "assets/images/astro_lost.svg";
import { Typography } from "@mui/material";
const Error = () => {
	return (
		<>
			<div className={styles.error_container}>
				<div className={styles.error_img}>
					<img src={lost_img} alt="lost" />
				</div>

				<div className={styles.error_message}>
					<Typography variant="h4" component="p">
						Oops! Something went wrong while loading this section
					</Typography>
					<Typography variant="h6" component="p">
						Our Engineers are working on it!
					</Typography>
				</div>
			</div>
		</>
	);
};

export default withErrorBoundary(Error, "Error");
