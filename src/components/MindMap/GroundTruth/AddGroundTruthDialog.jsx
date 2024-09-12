import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import GroundTruthsInputs from "./GroundTruthsInputs";

const AddGroundTruthDialog = ({ open, onClose }) => {
	const { Post } = useApiCall();
	const {
		register,
		handleSubmit,
		formState,
		reset: resetForm,
	} = useForm({
		defaultValues: {
			question: "",
			answer: "",
			action_id: "",
		},
	});

	const addSuggestion = async ({ question, answer, action_id }) => {
		try {
			await Post(1, "ground_truth/create", { question, answer, action_id });
			toast.success("Ground Truth Added Successfully!");
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
			onSubmit={handleSubmit(addSuggestion)}
			title="Add Suggestion"
		>
			<GroundTruthsInputs register={register} formState={formState} />
		</MuiDialog>
	);
};

export default withErrorBoundary(AddGroundTruthDialog, "AddGroundTruthDialog");
