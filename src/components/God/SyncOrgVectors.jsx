import { Button, Container, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { toast } from "react-toastify";
import { useOrgContext } from "context/OrgContext";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";

const SyncOrgVectors = () => {
	const { Post } = useApiCall();
	const {
		org: { host_url, name },
	} = useOrgContext();

	async function syncOrgVectors() {
		try {
			await Post(1, "sync_vectors", { host_url });
			toast.success(`Started syncing vectors for ${name}`);
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
					Sync Vectors for {name}
				</Typography>
				<Typography
					variant="subtitle2"
					style={{
						textAlign: "center",
					}}
				>
					Host URL: {host_url}
				</Typography>
				<Button
					onClick={syncOrgVectors}
					variant="contained"
					fullWidth
					sx={{ mt: 2 }}
				>
					Sync
				</Button>
			</>
		</Container>
	);
};

export default withErrorBoundary(SyncOrgVectors, "SyncOrgVectors");
