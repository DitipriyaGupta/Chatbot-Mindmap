import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect, useState } from "react";
import {
	MenuItem,
	TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useApiCall } from "components/common/appHooks.js";
import MuiDialog from "components/common/MuiDialog";
import InputAdornment from "@mui/material/InputAdornment";
import {
	REQUEST_CANCELED_MESSAGE,
	TEXT_MAX_TOKENS,
} from "components/common/constants";
import axios from "axios";
import { useUserContext } from "context/UserContext";

const EditDataDialog = ({
	openEditDialog,
	setOpenEditDialog,
	editData,
	// editDescription,
	setData,
	handleCloseEditDialog,
}) => {
	const axiosCancelSource = axios.CancelToken.source();
	const { Post, Get } = useApiCall();
	const [loading, setLoading] = useState(false);
	const [businessActions, setBusinessAction] = useState([]);
	const {
		user: { is_god },
	} = useUserContext();
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm({
		defaultValues: {
			text: editData.metadata.text,
			read_more_link: editData.metadata.read_more_link,
			read_more_label: editData.metadata.read_more_label,
			action_id: editData.metadata.action_id ?? "",
		},
	});
	const text = watch("text", editData.metadata.text);
	// const [description, setDescription] = useState(editDescription);

	async function onSubmit({
		text,
		read_more_link,
		read_more_label,
		action_id,
	}) {
		setLoading(true);
		try {
			await Post(1, `update_vector`, {
				vector_id: editData.vector_id,
				text,
				read_more_link,
				read_more_label,
				action_id,
			});

			// Update the originally mapped data
			setData((prevData) =>
				prevData.map((item) =>
					item.vector_id === editData.vector_id
						? {
								...item,
								metadata: { ...item.metadata, text, read_more_link, action_id },
							}
						: item
				)
			);

			toast.success("Data updated successfully!");
			handleClose();
			setLoading(false);
		} catch (error) {
			console.error("Error updating data:", error);
			toast.error("Failed to update data.");
			setLoading(false);
		}
	}
	async function handleClose() {
		setOpenEditDialog(false);
		handleCloseEditDialog();
	}
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
		if (is_god) getActions();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [is_god]);

	return (
		<MuiDialog
			open={openEditDialog}
			onClose={handleClose}
			title="Edit Data"
			onSubmit={handleSubmit(onSubmit)}
			submitButtonText="Save"
			submitDisabled={loading}
		>
			<TextField
				{...register("text", {
					required: "Required",
					maxLength: {
						value: TEXT_MAX_TOKENS,
						message: `Description exceeds ${TEXT_MAX_TOKENS} characters`,
					},
				})}
				label="Data"
				multiline
				rows={5}
				fullWidth
				margin="normal"
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{text.length} / {TEXT_MAX_TOKENS}
						</InputAdornment>
					),
				}}
			/>
			<TextField
				label="Read More/Source Link"
				fullWidth
				margin="normal"
				{...register("read_more_link")}
				error={errors?.read_more_link?.type}
				helperText={
					errors?.read_more_link?.message ??
					"The Source or Read More link user gets at the end of the message"
				}
			/>
			<TextField
				label="Read More Label"
				fullWidth
				margin="normal"
				{...register("read_more_label")}
				error={errors?.read_more_label?.type}
				helperText={
					errors?.read_more_label?.message ??
					"The label for Read More link user gets at the end of the message"
				}
			/>
			{is_god ? (
        <TextField
          fullWidth
					select
					{...register("action_id")}
					label="Business Action"
					defaultValue={editData.metadata.action_id ?? ""}
				>
					<MenuItem value="">No Action</MenuItem>
					{businessActions.map((businessAction) => (
						<MenuItem value={businessAction.id} key={businessAction.id}>
							{businessAction.name}
						</MenuItem>
					))}
				</TextField>
			) : null}
			{/* <TextField
				label="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				multiline
				fullWidth
				margin="normal"
			/> */}
		</MuiDialog>
	);
};

export default withErrorBoundary(EditDataDialog, "EditDataDialog");
