import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Typography } from "@mui/material";
import React from "react";

const JSONToHTML = ({ data }) => {
	function snakeCaseToNormal(sentence) {
		// Split the snake_case string into words
		const words = sentence.split("_");

		// Capitalize the first letter of each word and join them with a space
		const normalSentence = words
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return normalSentence;
	}
	const renderData = (obj) => {
		return Object.entries(obj).map(([key, value], index) => {
			if (
				typeof value === "object" &&
				!Array.isArray(value) &&
				value !== null
			) {
				// Object: render recursively
				return (
					<div key={index}>
						<Typography variant="body1" color="primary">
							{snakeCaseToNormal(key)}
						</Typography>
						<div style={{ marginLeft: "20px" }}>{renderData(value)}</div>
					</div>
				);
			} else if (Array.isArray(value)) {
				// Array: check if it's an array of objects or primitive values
				return (
					<div key={index}>
						<Typography variant="body1" color="primary">
							{snakeCaseToNormal(key)}
						</Typography>
						{value.map((item, idx) =>
							typeof item === "object" ? (
								<div key={idx} style={{ marginLeft: "20px" }}>
									{renderData(item)}
								</div>
							) : (
								<Typography
									variant="body2"
									key={idx}
									style={{ marginLeft: "20px" }}
								>
									{item}
								</Typography>
							)
						)}
					</div>
				);
			} else {
				// Primitive value
				return (
					<p key={index}>
						<Typography variant="body1" color="primary">
							{snakeCaseToNormal(key)}
						</Typography>
						<Typography variant="body2" style={{ marginLeft: "20px" }}>
							{value}
						</Typography>
						<br />
					</p>
				);
			}
		});
	};

	return <div>{renderData(data)}</div>;
};

export default withErrorBoundary(JSONToHTML, "JSONToHTML");
