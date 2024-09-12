import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	IconButton,
	Tooltip,
	Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { DialogLoader, SmallLoader } from "components/common/NewLoader";
import Swal from "sweetalert2/dist/sweetalert2";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import {
	SortableElement,
	SortableContainer,
	SortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import MenuIcon from "@mui/icons-material/Menu";

import MuiDialog from "components/common/MuiDialog";
const AddGroundTruthDialog = lazy(() => import("./AddGroundTruthDialog"));
const EditGroundTruthDialog = lazy(() => import("./EditGroundTruthDialog"));

const GroundTruthDialog = ({
	openGroundTruthDialog,
	setOpenGroundTruthDialog,
}) => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();

	const [addGroundTruthDialogOpen, setAddGroundTruthDialogOpen] =
		useState(false);
	const [loading, setLoading] = useState(true);
	const [groundTruths, setGroundTruths] = useState([]);
	const [businessActions, setBusinessAction] = useState([]);
	async function getGroundTruths(update = false) {
		try {
			if (!update) setLoading(true);
			const response = await Get(
				1,
				"ground_truth/view_all",
				axiosCancelSource.token
			);
			setGroundTruths(response.data.data.sort((a, b) => a.order - b.order));
		} catch (error) {
			toast.error(error?.message || "Something Went Wrong");
		} finally {
			setLoading(false);
		}
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
		getGroundTruths();
		getActions();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, []);

	const handleGroundTruthSort = async ({ oldIndex, newIndex }) => {
		try {
			setGroundTruths((prev) => arrayMoveImmutable(prev, oldIndex, newIndex));
			const response = await Post(1, "ground_truth/change_order", {
				suggested_question_id: groundTruths[oldIndex]?.id,
				old_order: groundTruths[oldIndex]?.order,
				new_order: groundTruths[newIndex]?.order,
			});
			setGroundTruths(response.data.data.sort((a, b) => a.order - b.order));
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message ?? "Something went wrong");
			} else toast.error("Something went wrong");
			setGroundTruths(groundTruths);
		}
	};
	const handleCloseAddGroundTruthDialog = async (update = false) => {
		if (update === true) getGroundTruths(update);
		setAddGroundTruthDialogOpen(false);
	};
	const handleCloseGroundTruthDialog = async () => {
		setOpenGroundTruthDialog(false);
	};

	return (
		<MuiDialog
			open={openGroundTruthDialog}
			onClose={handleCloseGroundTruthDialog}
			title="Ground Truths"
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
						onClick={() => setAddGroundTruthDialogOpen(true)}
					>
						Add Ground Truth
					</Button>

					{loading ? (
						<SmallLoader />
					) : groundTruths.length ? (
						<>
							<SortableGroundTruth
								getGroundTruths={getGroundTruths}
								groundTruths={groundTruths}
								onSortEnd={handleGroundTruthSort}
								businessActions={businessActions}
								useDragHandle
							/>
						</>
					) : (
						<Typography textAlign="center">No Ground Truths Added</Typography>
					)}
				</div>
				<br />
				<Suspense fallback={<DialogLoader />}>
					{addGroundTruthDialogOpen ? (
						<AddGroundTruthDialog
							open={addGroundTruthDialogOpen}
							onClose={handleCloseAddGroundTruthDialog}
						/>
					) : null}
				</Suspense>
			</>
		</MuiDialog>
	);
};

const SortableGroundTruth = SortableContainer(
	({ groundTruths, getGroundTruths, businessActions }) => {
		return (
			<div>
				{groundTruths.map((groundTruth, index) => (
					<GroundTruth
						groundTruth={groundTruth}
						key={groundTruth.id}
						getGroundTruths={getGroundTruths}
						businessActions={businessActions}
						index={index}
					/>
				))}
			</div>
		);
	}
);
const DragHandle = SortableHandle(() => (
	<Tooltip title="Click and Drag to Change Order">
		<MenuIcon sx={{ color: "gray", mr: 2 }} />
	</Tooltip>
));
const GroundTruth = SortableElement(
	({
		groundTruth = {
			question: "",
			answer: "",
			action_id: "",
		},
		getGroundTruths,
		businessActions,
	}) => {
		const { Post } = useApiCall();
		const [openEditDialog, setOpenEditDialog] = useState(false);

		const action = useMemo(
			() => businessActions.find(({ id }) => id === groundTruth.action_id),
			[businessActions, groundTruth.action_id]
		);
		async function handleOpenEditGroundTruthDialog(e) {
			e?.stopPropagation();
			setOpenEditDialog(true);
		}
		const handleCloseEditGroundTruthDialog = async (update = false) => {
			if (update === true) getGroundTruths();
			setOpenEditDialog(false);
		};
		async function handleGroundTruthDelete(e) {
			e?.stopPropagation();
			try {
				const result = await Swal.fire({
					title: `Are you sure?`,
					text: `This Ground Truth will no longer exist`,
					icon: "warning",
					showCancelButton: true,
				});
				if (result.isConfirmed) {
					await Post(
						1,
						"ground_truth/delete",
						{ question_id: groundTruth.id },
						undefined,
						{ showProgress: true }
					);
					toast.success(`Ground Truth Deleted Successfully`);
					getGroundTruths(true);
				}
			} catch (error) {
				toast.error(error?.response?.data?.message ?? "Something went wrong");
				console.error(error);
			}
		}
		return (
			<>
				<Accordion style={{ zIndex: 99999999 }}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						sx={{
							"& .MuiAccordionSummary-content": {
								display: "flex",
								alignItems: "center",
							},
						}}
					>
						<DragHandle />
						<Typography component="div">{groundTruth.question}</Typography>
						<IconButton
							aria-label="edit"
							sx={{ marginLeft: "auto" }}
							onClick={handleOpenEditGroundTruthDialog}
						>
							<EditIcon />
						</IconButton>
						<IconButton aria-label="delete" onClick={handleGroundTruthDelete}>
							<DeleteIcon />
						</IconButton>
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
						{groundTruth.answer || "AI will answer this question"}
						{action?.name ? <Button>{action?.name}</Button> : null}
					</AccordionDetails>
				</Accordion>
				<Suspense fallback={<DialogLoader />}>
					{openEditDialog ? (
						<EditGroundTruthDialog
							open={openEditDialog}
							groundTruth={groundTruth}
							onClose={handleCloseEditGroundTruthDialog}
						/>
					) : null}
				</Suspense>
			</>
		);
	}
);
export default withErrorBoundary(GroundTruthDialog, "GroundTruthDialog");
