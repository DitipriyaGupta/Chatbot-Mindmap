import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { TextField } from "@mui/material";
import axios from "axios";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const AddChatsDialog = ({ open, onClose }) => {
	const { Post } = useApiCall();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm({
		defaultValues: {
			chat_ids: "",
		},
	});
	async function onSubmit({ chat_ids = "" }) {
		try {
			await Post(1, "add_chats_to_demo_org", {
				chat_ids: chat_ids
					.split(",")
					.map((chat_id) => parseInt(chat_id.trim()))
					.filter(Boolean),
			});
			toast.success("Added Chats Successfully");
			resetForm();
			onClose();
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				toast.error(error.message || "Something Went Wrong");
			} else {
				toast.error("Something Went Wrong");
			}
		}
	}
	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			title="Add Data"
			onSubmit={handleSubmit(onSubmit)}
			submitButtonText="Save"
		>
			<TextField
				label="Chat Id"
				fullWidth
				margin="normal"
				{...register("chat_ids")}
				error={errors?.chat_ids?.type}
				helperText={
					errors?.chat_ids?.message ??
					"add comma(,) separated chat ids to Add to Demo Account"
				}
			/>
		</MuiDialog>
	);
};

export default withErrorBoundary(AddChatsDialog, "AddChatsDialog");
