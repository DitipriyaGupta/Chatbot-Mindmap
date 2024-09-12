import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Container, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React, { useState } from "react";
import { toast } from "react-toastify";
import OrgInputs from "./OrgInputs";

const CreateNewOrg = () => {
	const { Post } = useApiCall();
	const [response, setResponse] = useState();

	const onSubmit = async (data) => {
		try {
			const res = await Post(1, "organization/create", data);
			setResponse(res.data);
			toast.success("Org Created Successfully");
		} catch (error) {
			setResponse(error);
			toast.success(error.message);
		}
	};
	return (
		<Container component="main" maxWidth="xs" sx={{ p: 2 }}>
			<>
				<Typography variant="h3" align="center">
					Create new Organization
				</Typography>
				<Typography variant="subtitle2" align="center">
					Will start with Trial Plan
				</Typography>
				<OrgInputs onSubmit={onSubmit} />
			</>
			{response ? (
				<Box
					component="pre"
					sx={{
						textWrap: "pretty",
						borderRadius: "8px",
						m: 2,
						p: 1,
						border: "1px solid var(--primary)",
					}}
				>
					{JSON.stringify(response, undefined, 2)}
				</Box>
			) : null}
		</Container>
	);
};

export default withErrorBoundary(CreateNewOrg, "CreateNewOrg");
