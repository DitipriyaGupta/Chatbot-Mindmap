import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { Suspense, lazy, useState } from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Divider } from "@mui/material";

const AddSuggestionsDialog = lazy(() => import("./AddSuggestionsDialog"));

const Suggestions = () => {
	const { chatConfig, setChatConfig } = useChatConfigContext();
	const [addSuggestionDialogOpen, setAddSuggestionDialogOpen] = useState(false);

	const deleteSuggestion = (index) => {
		setChatConfig({
			suggestedQuestions: chatConfig.suggestedQuestions.filter(
				(_, i) => i !== index
			),
		});
	};

	const handleCloseAddSuggestionDialog = async () => {
		setAddSuggestionDialogOpen(false);
	};
	return (
		<>
			{chatConfig.suggestedQuestions.map((suggestion, index) => {
				return (
					<>
						<Suggestion
							suggestion={suggestion}
							index={index}
							key={index}
							deleteSuggestion={deleteSuggestion}
						/>
						<Divider variant="middle" />
					</>
				);
			})}
			<br />
			<Button
				color="primary"
				variant="outlined"
				endIcon={<AddCircleIcon />}
				onClick={() => setAddSuggestionDialogOpen(true)}
			>
				Add Suggestion
			</Button>
			<Suspense fallback={<></>}>
				<AddSuggestionsDialog
					open={addSuggestionDialogOpen}
					onClose={handleCloseAddSuggestionDialog}
				/>
			</Suspense>
		</>
	);
};

const Suggestion = ({
	suggestion = {
		question: "",
		answer: "",
		action_id: NaN,
	},
	index,
	deleteSuggestion,
}) => {
	const { chatConfig, setChatConfig, businessActions } = useChatConfigContext();

	async function handleChange(value, key) {
		const suggestedQuestions = [...chatConfig.suggestedQuestions];
		suggestedQuestions.splice(index, 1, {
			...suggestedQuestions[index],
			[key]: value,
		});

		setChatConfig({
			suggestedQuestions,
		});
	}
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<TextField
				fullWidth
				value={suggestion.question}
				onChange={(e) => handleChange(e.target.value, "question")}
				placeholder="edit question"
				InputProps={{
					endAdornment: (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}
						>
							<Button
								variant="outlined"
								color="secondary"
								onClick={() => {
									deleteSuggestion(index);
								}}
							>
								Delete
							</Button>
						</div>
					),
				}}
			/>

			<TextField
				fullWidth
				value={suggestion.answer}
				onChange={(e) => handleChange(e.target.value, "answer")}
				placeholder="Add a answer or leave blank"
				multiline
			/>

			<TextField
        select
        sx={{ width: "100%" }}
				value={suggestion.action_id}
				label="Business Action"
				defaultValue=""
				onChange={(e) => handleChange(e.target.value, "action_id")}
			>
				<MenuItem value="">No Action</MenuItem>
				{businessActions.map((businessAction) => (
					<MenuItem value={businessAction.id}>{businessAction.name}</MenuItem>
				))}
			</TextField>
		</div>
	);
};

export default withErrorBoundary(Suggestions, "Suggestions");
