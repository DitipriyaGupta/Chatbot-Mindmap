import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	Box,
	Button,
	Checkbox,
	Container,
	FormControlLabel,
	TextField,
	Typography,
} from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { toast } from "react-toastify";
import { useOrgContext } from "context/OrgContext";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2/dist/sweetalert2";
import { useHistory } from "react-router-dom";

const DeleteOrg = () => {
	const { Post } = useApiCall();
	const {
		org: { host_url, name },
		getOrgs,
	} = useOrgContext();
	const history = useHistory();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			host_url: "",
			delete_namespace: true,
		},
	});

	async function deleteOrg({ delete_namespace }) {
		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `${name} will no longer exist`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "organization/delete", { host_url, delete_namespace });
				toast.success(`${name} Deleted Successfully`);
				getOrgs();
				history.replace("/organization");
			}
		} catch (error) {
			toast.error(error?.response?.data?.message ?? "Something went wrong");
		}
	}

	return (
		<Container component="main" maxWidth="xs" sx={{ p: 2 }}>
			<>
				<Typography
					variant="h3"
					style={{
						textAlign: "center",
					}}
				>
					Delete {name}
				</Typography>
				<Typography
					variant="subtitle2"
					style={{
						textAlign: "center",
					}}
				>
					Host URL: {host_url}
				</Typography>
				<Box
					component="form"
					onSubmit={handleSubmit(deleteOrg)}
					sx={{ mt: 2, gap: 2, display: "flex", flexDirection: "column" }}
				>
					<TextField
						{...register("host_url", {
							validate: (value) => value === host_url,
						})}
						label="Host URL"
						required
						placeholder="example.com"
						variant="outlined"
						fullWidth
						error={!!errors.host_url}
						helperText={
							errors.host_url
								? "Input doest match with the Host URL"
								: "Please confirm the Host URL of the Organization you wish to delete"
						}
					/>
					<FormControlLabel
						control={
							<Checkbox {...register("delete_namespace")} defaultChecked />
						}
						label="Delete Namespace from Vector DB?"
					/>
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						fullWidth
						sx={{ mt: 2 }}
					>
						Delete
					</Button>
				</Box>
			</>
		</Container>
	);
};

export default withErrorBoundary(DeleteOrg, "DeleteOrg");
