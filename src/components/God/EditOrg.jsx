import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Container, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrgInputs from "./OrgInputs";
import axios from "axios";
import { SmallLoader } from "components/common/NewLoader";
import { useOrgContext } from "context/OrgContext";
import compareObj from "components/common/compareObj";
import emptyStringToNullInObject from "components/common/emptyStringToNullInObject";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";

const EditOrg = () => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const {
		org: { host_url },
	} = useOrgContext();
	const [response, setResponse] = useState();
	const [orgDetails, setOrgDetails] = useState({});
	const [loading, setLoading] = useState(true);

	async function getOrgDetails() {
		try {
			setLoading(true);
			const response = await Get(
				1,
				"organization/view",
				{ host_url },
				axiosCancelSource.token
			);
			setOrgDetails({
				...response.data.data,
				new_host_url: response.data.data.host_url,
			});
			setLoading(false);
		} catch (error) {
			if (error.message !== REQUEST_CANCELED_MESSAGE) {
				toast.error(error?.response?.data?.message ?? "Something went wrong");
				setLoading(false);
			}
		}
	}

	useEffect(() => {
		getOrgDetails();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [host_url]);

	const onSubmit = async (data) => {
		try {
			const newObj = compareObj(orgDetails, data);
			if (!Object.keys(newObj).length) {
				toast.error("No Changes has been made");
				return;
			}
			const res = await Post(
				1,
				"organization/edit",
				emptyStringToNullInObject(newObj)
			);
			setResponse(res.data);
			toast.success("Org Updated Successfully");
		} catch (error) {
			setResponse(error);
			toast.error(error.message);
		}
	};
	return (
		<Container component="main" maxWidth="xs" sx={{ p: 2 }}>
			<>
				<Typography
					variant="h3"
					style={{
						textAlign: "center",
					}}
				>
					Edit Organization
				</Typography>
				{loading ? (
					<SmallLoader />
				) : (
					<OrgInputs onSubmit={onSubmit} defaultValues={orgDetails} />
				)}
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

export default withErrorBoundary(EditOrg, "EditOrg");
