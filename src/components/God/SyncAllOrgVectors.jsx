import { Button, Container, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React from "react";
import { toast } from "react-toastify";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";

const SyncAllOrgVectors = () => {
	const { Post } = useApiCall();
	async function syncAllOrgVectors() {
		try {
			await Post(1, "sync_all_vectors");
			toast.success(`Started syncing vectors for All Orgs`);
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
					Sync Vectors for All Org
				</Typography>
				<Button
					onClick={syncAllOrgVectors}
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

export default withErrorBoundary(SyncAllOrgVectors, "SyncOrgVectors");
