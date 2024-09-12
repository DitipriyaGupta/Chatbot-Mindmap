import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { toast } from "react-toastify";
import { useOrgContext } from "context/OrgContext";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2/dist/sweetalert2";

const ClearOrgChats = () => {
	const { Post } = useApiCall();
	const {
		org: { host_url, name },
	} = useOrgContext();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			host_url: "",
		},
	});

	async function deleteOrg() {
		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `All the Chats in ${name} will be deleted`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "organization/delete_chats", { host_url });
				toast.success(`All Chats in ${name} Deleted Successfully`);
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
					Clear {name}'s Chats
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
						label="Host URL*"
						placeholder="example.com"
						variant="outlined"
						fullWidth
						error={!!errors.host_url}
						helperText={
							errors.host_url
								? "Input doest match with the Host URL"
								: "Please confirm the Host URL of the Organization you wish to delete chats of"
						}
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

export default withErrorBoundary(ClearOrgChats, "ClearOrgChats");
