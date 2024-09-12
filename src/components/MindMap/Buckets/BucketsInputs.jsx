import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { TextField } from "@mui/material";
import React from "react";

const BucketsInput = ({ register, formState: { errors } }) => {
	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					gap: 5,
				}}
			>
				<TextField
					label="Title"
					{...register("title", {
						required: "Required",
					})}
					error={errors?.question?.type}
					fullWidth
					helperText={errors?.question?.message}
					placeholder="Company Data"
				/>

				<TextField
					label="Description"
					{...register("description")}
					placeholder="Basic Information about the company"
					multiline
					rows={5}
					fullWidth
				/>
				<TextField
					label="Priority"
					{...register("priority", {
						valueAsNumber: true,
						validate: (value) => value > 0,
					})}
					placeholder="1"
					fullWidth
					type="number"
				/>
			</div>
		</>
	);
};

export default withErrorBoundary(BucketsInput, "BucketsInput");
