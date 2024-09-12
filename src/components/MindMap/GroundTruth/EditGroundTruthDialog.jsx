import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import GroundTruthsInputs from "./GroundTruthsInputs";

const EditGroundTruthDialog = ({
	open,
	onClose,
	groundTruth = {
		question: "",
		answer: "",
		action_id: "",
		id: NaN,
	},
}) => {
	const { Post } = useApiCall();
	const {
		register,
		handleSubmit,
		formState,
		reset: resetForm,
	} = useForm({
		defaultValues: groundTruth,
	});

	const editSuggestions = async ({ question, answer, action_id }) => {
		try {
			await Post(1, "ground_truth/edit", {
				question,
				answer,
				action_id,
				question_id: groundTruth.id,
			});
			toast.success("Ground Truth Edited Successfully!");
			resetForm();
			onClose(true);
		} catch (error) {
			toast.error(error.message || "Something Went Wrong");
		}
	};

	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			onSubmit={handleSubmit(editSuggestions)}
			title="Edit Suggestion"
		>
			<GroundTruthsInputs register={register} formState={formState} />
		</MuiDialog>
	);
};

export default withErrorBoundary(
	EditGroundTruthDialog,
	"EditGroundTruthDialog"
);
