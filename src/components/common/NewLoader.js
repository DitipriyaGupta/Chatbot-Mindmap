import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { GridLoader } from "react-spinners";
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import makeStyles from "@mui/styles/makeStyles";
import quotes from "./quotes.js";

// const color = "var(--primary)";
// const loader_list = [
// 	<GridLoader {...{ color }} />,
// 	// <ClimbingBoxLoader {...{ color }} />,
// 	// <ScaleLoader style={{ alignSelf: "center" }} {...{ color }} />,
// ];

export const SmallLoader = ({
	height = "500px",
	width = "95%",
	text = false,
}) => {
	return (
		<div className="small-loader" style={{ height, width }}>
			<div className="small-loader-inner">
				<GridLoader color="var(--primary)" />
				<span
					className="small-loader-text"
					style={{
						display: text ? "block" : "none",
					}}
				>
					Fetching Content...
				</span>
			</div>
		</div>
	);
};

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		background: "#ffffff00",
	},
}));

export const DialogLoader = () => {
	const classes = useStyles();

	return (
		<Backdrop classes={{ root: classes.backdrop }} open={true}>
			<div
				className="small-loader"
				style={{
					height: "250px",
					width: "250px",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<GridLoader color="var(--primary)" />
			</div>
		</Backdrop>
	);
};

const Loader = () => {
	let selected_quote = quotes[Math.floor(Math.random() * quotes.length)];

	return (
		<div className="init-loader">
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<GridLoader color="var(--primary)" />
				<span style={{ color: "black" }}>Fetching Content...</span>
			</div>

			<div className="init-loader-text">
				<blockquote>{selected_quote.quote} </blockquote>
				{/* <cite> - {cite} </cite> */}
			</div>
		</div>
	);
};

export default withErrorBoundary(Loader, "Loader");
