import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	MenuItem,
	TextField,
} from "@mui/material";
import MuiDialog from "components/common/MuiDialog";
import React from "react";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";
import { useForm } from "react-hook-form";

const AddSuggestionsDialog = ({ open, onClose }) => {
	const { chatConfig, setChatConfig, businessActions } = useChatConfigContext();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm({
		defaultValues: {
			question: "",
			answer: "",
			action_id: "",
		},
	});

	const addSuggestion = async ({ question, answer, action_id }) => {
		setChatConfig({
			suggestedQuestions: [
				...chatConfig.suggestedQuestions,
				{ question, answer, action_id },
			],
		});
		onClose();
		resetForm();
	};

	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			onSubmit={handleSubmit(addSuggestion)}
			title="Add Suggestion"
		>
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
					{...register("action_id")}
					label="Business Action"
          sx={{ minWidth: 80 }}
          defaultValue=""
				>
					<MenuItem value="">No Action</MenuItem>
					{businessActions.map((businessAction) => (
						<MenuItem value={businessAction.id}>{businessAction.name}</MenuItem>
					))}
				</TextField>
			</div>
		</MuiDialog>
	);
};

export default withErrorBoundary(AddSuggestionsDialog, "AddSuggestionsDialog");
