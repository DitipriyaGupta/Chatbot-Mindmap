import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BucketsInputs from "./BucketsInputs";

const AddBucketDialog = ({ open, onClose }) => {
	const { Post } = useApiCall();
	const {
		register,
		handleSubmit,
		formState,
		reset: resetForm,
	} = useForm({
		defaultValues: {
			title: "",
			description: "",
			priority: 1,
		},
	});

	const addSuggestion = async ({ title, description, priority }) => {
		try {
			await Post(1, "buckets/create", { title, description, priority });
			toast.success("Bucket Added Successfully!");
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
			<BucketsInputs register={register} formState={formState} />
		</MuiDialog>
	);
};

export default withErrorBoundary(AddBucketDialog, "AddGroundTruthDialog");
