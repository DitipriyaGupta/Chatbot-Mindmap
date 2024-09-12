import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { TextField } from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import makeStyles from "@mui/styles/makeStyles";
import { toast } from "react-toastify";
import { MenuItem } from "@mui/material";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import {
	ORG_ADMIN,
	ORG_ADMIN_ID,
	ORG_EDITOR,
	ORG_EDITOR_ID,
	ORG_SALES,
	ORG_SALES_ID,
	ORG_VIEWER,
	ORG_VIEWER_ID,
	ORG_META_EDITOR,
	ORG_META_EDITOR_ID,
	ORG_META_VIEWER,
	ORG_META_VIEWER_ID,
	FEATURE_DISABLED_MESSAGE,
} from "components/common/constants";
import { useUserContext } from "context/UserContext";
import { useOrgContext } from "context/OrgContext";

const useStyles = makeStyles((theme) => ({
	container: {
		display: "flex",
		gap: 10,
		margin: 10,
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
		},
	},
}));

const AddNewMember = ({ open, onClose }) => {
	const { Post } = useApiCall();
	const classes = useStyles();
	const [loading, setLoading] = useState(false);
	const {
		user: { is_god },
	} = useUserContext();
	const { isDemo } = useOrgContext();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm({
		defaultValues: {
			name: "",
			email: "",
			role_id: ORG_EDITOR_ID,
		},
	});
	async function onSubmit({ name, email, role_id }) {
		if (isDemo && !is_god) {
			toast.info(FEATURE_DISABLED_MESSAGE);
			return;
		}
		try {
			if (loading) return;
			setLoading(true);
			await Post(1, "add_user_to_org", { name, email, role_id });
			toast.success(`Invited ${name} to Org`);
			resetForm();
			onClose();
		} catch (error) {
		} finally {
			setLoading(false);
		}
	}
	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			title="Add New Member"
			onSubmit={handleSubmit(onSubmit)}
			submitDisabled={loading}
			containerClass={classes.container}
		>
			<TextField
				{...register("name", { required: "Required" })}
				label="Name"
				error={errors?.name?.type}
				helperText={errors?.name?.message}
			/>
			<TextField
				{...register("email", {
					required: "Required",
					pattern: {
						value: /\S+@\S+\.\S+/,
						message: "Must be a valid Email",
					},
				})}
				type="email"
				label="Email"
				error={errors?.email?.type}
				helperText={errors?.email?.message}
			/>

      <TextField
        sx={{ minWidth: 80 }}
				select
				defaultValue={ORG_EDITOR_ID}
				{...register("role_id")}
				label="Role"
			>
				{[
					{ value: ORG_ADMIN_ID, label: ORG_ADMIN },
					{ value: ORG_EDITOR_ID, label: ORG_EDITOR },
					{ value: ORG_VIEWER_ID, label: ORG_VIEWER },
					{ value: ORG_SALES_ID, label: ORG_SALES },
					...(is_god
						? [
								{ value: ORG_META_VIEWER_ID, label: ORG_META_VIEWER },
								{ value: ORG_META_EDITOR_ID, label: ORG_META_EDITOR },
							]
						: []),
				].map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</TextField>
		</MuiDialog>
	);
};

export default withErrorBoundary(AddNewMember, "AddNewMember");
