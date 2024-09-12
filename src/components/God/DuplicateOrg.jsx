import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Button, Container, Typography } from "@mui/material";
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
		setOrg,
	} = useOrgContext();
	const history = useHistory();

	const { handleSubmit } = useForm({
		defaultValues: {
			host_url: "",
			delete_namespace: true,
		},
	});

	async function duplicateOrg() {
		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `There will be 2 ${name}`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				const response = await Post(1, "organization/duplicate", { host_url });
				setOrg(response.data.data);
				toast.success(`${name} Duplicated Successfully`);
				getOrgs();
				history.replace(
					`/${response.data.data.host_url}/god/edit-organization-details`
				);
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
					Duplicate {name}
				</Typography>
				<Typography
					variant="subtitle2"
					style={{
						textAlign: "center",
					}}
				>
					Host URL: {host_url} <br /> <br />
					Buckets will be shared between the Orgs, Duplicated Org Should only be
					used for testing and viewing data, any updates made in the mind map
					will also change it for the original Org if they are sharing the same
					namespace,
				</Typography>
				<Box
					component="form"
					onSubmit={handleSubmit(duplicateOrg)}
					sx={{ mt: 2, gap: 2, display: "flex", flexDirection: "column" }}
				>
					<Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
						Duplicate
					</Button>
				</Box>
			</>
		</Container>
	);
};

export default withErrorBoundary(DeleteOrg, "DeleteOrg");
