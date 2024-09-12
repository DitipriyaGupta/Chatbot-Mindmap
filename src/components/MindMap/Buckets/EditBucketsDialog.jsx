import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BucketsInputs from "./BucketsInputs";

const EditBucketDialog = ({
	open,
	onClose,
	bucket = {
		title: "",
		description: "",
		priority: NaN,
	},
}) => {
	const { Post } = useApiCall();
	const {
		register,
		handleSubmit,
		formState,
		reset: resetForm,
	} = useForm({
		defaultValues: bucket,
	});

	const editSuggestions = async ({ title, description, priority }) => {
		try {
			await Post(1, "buckets/edit", {
				title,
				description,
				priority,
				bucket_id: bucket.id,
			});
			toast.success("Bucket Edited Successfully!");
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
			title="Edit Bucket"
		>
			<BucketsInputs register={register} formState={formState} />
		</MuiDialog>
	);
};

export default withErrorBoundary(EditBucketDialog, "EditBucketDialog");
