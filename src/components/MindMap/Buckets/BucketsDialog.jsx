import React, { Suspense, lazy, useEffect, useState } from "react";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	IconButton,
	Switch,
	Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { SmallLoader } from "components/common/NewLoader";
import Swal from "sweetalert2/dist/sweetalert2";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";

import MuiDialog from "components/common/MuiDialog";
const AddBucketDialog = lazy(() => import("./AddBucketDialog"));
const EditBucketsDialog = lazy(() => import("./EditBucketsDialog"));

const BucketsDialog = ({ openBucketsDialog, setOpenBucketsDialog }) => {
	const { Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();

	const [addBucketDialogOpen, setAddBucketDialogOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [buckets, setBuckets] = useState([]);
	async function getBuckets(update = false) {
		try {
			if (!update) setLoading(true);
			const response = await Get(
				1,
				"buckets/view_all",
				axiosCancelSource.token
			);
			setBuckets(response.data.data);
		} catch (error) {
			toast.error(error?.message || "Something Went Wrong");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getBuckets();

		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, []);

	const handleCloseAddGroundTruthDialog = async (update = false) => {
		if (update === true) getBuckets(update);
		setAddBucketDialogOpen(false);
	};
	const handleCloseBucketsDialog = async () => {
		setOpenBucketsDialog(false);
	};
	return (
		<MuiDialog
			open={openBucketsDialog}
			onClose={handleCloseBucketsDialog}
			title="Buckets"
			disableButtons
			// width="100%"
		>
			<>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "stretch",
						gap: 12,
						flexDirection: "column",
					}}
				>
					<Button
						color="primary"
						variant="outlined"
						endIcon={<AddCircleIcon />}
						onClick={() => setAddBucketDialogOpen(true)}
					>
						Add Bucket
					</Button>

					{loading ? (
						<SmallLoader />
					) : buckets.length ? (
						<>
							{buckets.map((bucket) => (
								<Bucket bucket={bucket} getBuckets={getBuckets} />
							))}
						</>
					) : (
						<Typography textAlign="center">No Bucket Added</Typography>
					)}
				</div>
				<br />
				<Suspense fallback={<></>}>
					<AddBucketDialog
						open={addBucketDialogOpen}
						onClose={handleCloseAddGroundTruthDialog}
					/>
				</Suspense>
			</>
		</MuiDialog>
	);
};

const Bucket = ({
	bucket = {
		title: "",
		description: "",
		priority: NaN,
		id: NaN,
		active: true,
	},
	getBuckets,
}) => {
	const { Post } = useApiCall();
	const [openEditDialog, setOpenEditDialog] = useState(false);
	async function handleOpenEditBucketDialog(e) {
		e?.stopPropagation();
		setOpenEditDialog(true);
	}
	const handleCloseEditBucketDialog = async (update = false) => {
		if (update === true) getBuckets();
		setOpenEditDialog(false);
	};
	async function handleBucketDelete(e) {
		e?.stopPropagation();
		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `This Bucket will no longer exist`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "buckets/delete", { bucket_id: bucket.id }, undefined, {
					showProgress: true,
				});
				toast.success(`Bucket Deleted Successfully`);
				getBuckets(true);
			}
		} catch (error) {
			toast.error(error?.response?.data?.message ?? "Something went wrong");
			console.error(error);
		}
	}
	async function handleToggleBucket(e) {
		e.stopPropagation();
		e.preventDefault();

		try {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: Boolean(e.target.checked)
					? `Data in this Bucket will be used to answer questions`
					: `Data in this Bucket will no longer be used to answer questions`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "buckets/toggle", { bucket_id: bucket.id }, undefined, {
					showProgress: true,
				});
				toast.success(
					`Bucket ${e.target.checked ? "Enabled" : "Disabled"} Successfully`
				);
				getBuckets(true);
			}
		} catch (error) {
			toast.error(error?.response?.data?.message ?? "Something went wrong");
			console.error(error);
		}
	}
	return (
		<>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					sx={{
						"& .MuiAccordionSummary-content": {
							display: "flex",
							alignItems: "center",
						},
					}}
				>
					<Typography component="div">
						{bucket.title}{" "}
						<Typography variant="subtitle2">
							Priority: {bucket.priority}
						</Typography>
					</Typography>
					<IconButton
						aria-label="edit"
						sx={{ marginLeft: "auto" }}
						onClick={handleOpenEditBucketDialog}
					>
						<EditIcon />
					</IconButton>
					<IconButton aria-label="delete" onClick={handleBucketDelete}>
						<DeleteIcon />
					</IconButton>
					<Switch
						size="small"
						checked={bucket?.active}
						onChange={handleToggleBucket}
					/>
				</AccordionSummary>
				<AccordionDetails
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 3,
						padding: "20px",
						borderTop: "1px solid",
						borderTopColor: "secondary.light",
					}}
				>
					{bucket.description || "No Description Added"}
				</AccordionDetails>
			</Accordion>
			<Suspense fallback={<></>}>
				<EditBucketsDialog
					open={openEditDialog}
					bucket={bucket}
					onClose={handleCloseEditBucketDialog}
				/>
			</Suspense>
		</>
	);
};
export default withErrorBoundary(BucketsDialog, "BucketsDialog");
