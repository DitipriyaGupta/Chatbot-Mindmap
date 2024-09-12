import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	MenuItem,
	TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";

const GroundTruthsInputs = ({
	register,
	formState: { errors, defaultValues },
}) => {
	const { Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const [businessActions, setBusinessAction] = useState([]);
	async function getActions() {
		try {
			const response = await Get(
				1,
				"actions/visible",
				{},
				axiosCancelSource.token
			);
			setBusinessAction(
				response.data.data.map((businessAction) => ({
					...businessAction,
					detail: businessAction?.detail
						? JSON.parse(businessAction.detail)
						: undefined,
				}))
			);
		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		getActions();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, []);

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
					label="Question*"
					{...register("question", {
						required: "Required",
					})}
					error={errors?.question?.type}
					fullWidth
					helperText={errors?.question?.message}
					placeholder="How Can I Buy?"
				/>

				<TextField
					label="Answer"
					{...register("answer")}
					placeholder="You can place your order by clicking on the button below"
					multiline
					rows={5}
					fullWidth
				/>
				<TextField
          select
          sx={{ minWidth: 80 }}
					{...register("action_id")}
					label="Business Action"
					defaultValue={defaultValues?.action_id}
				>
					<MenuItem value="">No Action</MenuItem>
					{businessActions.map((businessAction) => (
						<MenuItem value={businessAction.id} key={businessAction.id}>
							{businessAction.name}
						</MenuItem>
					))}
				</TextField>
			</div>
		</>
	);
};

export default withErrorBoundary(GroundTruthsInputs, "GroundTruthsInputs");
