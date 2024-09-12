import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { lazy, useCallback, useEffect, useMemo, useState } from "react";
import MuiDialog from "../common/MuiDialog";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import { IconButton, Pagination, Stack, Tooltip } from "@mui/material";
import { Chip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CachedIcon from "@mui/icons-material/Cached";
import CancelIcon from "@mui/icons-material/Cancel";
import ReplayIcon from "@mui/icons-material/Replay";
import { toast } from "react-toastify";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import JSONToHTML from "components/common/JSONToHTML";
import { useUserContext } from "context/UserContext";
import Delete from "@mui/icons-material/Delete";

const CustomNoRowsOverlay = lazy(
	() => import("components/common/CustomNoRowsOverlay")
);

const SUCCESS = 1;
const PENDING = 2;
const FAILED = 3;

// Also see AddDataDialog
const PDF = 1;
const TEXT = 2;
const LINK = 3;
const EPUB = 4;
const CSV = 5;
const types = {
	[PDF]: "PDF",
	[TEXT]: "Text",
	[LINK]: "Link",
	[EPUB]: "EPUB",
	[CSV]: "CSV",
};
const ViewTrainingStatusDialog = ({ openTasksDialog, setOpenTasksDialog }) => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [count, setCount] = useState(1);
	const [tasks, setTasks] = useState([]);
	const {
		user: { is_god },
	} = useUserContext();

	async function handleClose() {
		setOpenTasksDialog(false);
	}
	async function handlePageChange(_, newPage) {
		setPage(newPage);
	}
	async function getTasks() {
		try {
			setLoading(true);
			const response = await Get(
				1,
				"get_training_data_status",
				{ page },
				axiosCancelSource.token
			);
			setTasks(response.data.data.data);
			setCount(response.data.data.last_page);
			setLoading(false);
		} catch (error) {
			console.error(error);
			if (error.message !== REQUEST_CANCELED_MESSAGE) setLoading(false);
		}
	}

	const handleRetry = useCallback(
		async (id) => {
			try {
				await Post(1, "reupload_failed_data_to_vector_db", {
					training_data_status_id: id,
				});
				setTasks((prev) =>
					prev.map((task) =>
						task.id === id ? { ...task, status: PENDING } : task
					)
				);
				toast.success("Data Added for processing");
			} catch (error) {
				console.error(error);
				if (error.message !== REQUEST_CANCELED_MESSAGE) setLoading(false);
			}
		},
		[Post]
	);
	const handleDelete = useCallback(
		async (filter) => {
			try {
				if (!is_god) return toast.error("You are not allowed to do this");
				const response = await Post(1, "delete_specific_sources", {
					filter,
				});
				toast(<JSONToHTML data={response.data.data} />, { theme: "dark" });
			} catch (error) {
				console.error(error);
			}
		},
		[Post, is_god]
	);

	useEffect(() => {
		if (openTasksDialog) getTasks();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [openTasksDialog, page]);

	const columns = useMemo(
		() => [
			// {
			// 	field: "id",
			// 	headerName: "ID",
			//   hide: true,
			//   flex:0,
			// },
			{
				field: "title",
				sortable: false,
				headerName: "Title",
				flex: 2,
			},
			{
				field: "type",
				sortable: false,
				headerName: "Type",
				flex: 1,
			},
			{
				field: "status",
				sortable: false,
				headerName: "Status",
				flex: 1,
				renderCell: (params) => {
					switch (params.value.status) {
						case SUCCESS:
							return (
								<Chip
									variant="outlined"
									label="Success"
									size="small"
									style={{ color: "#56F000", borderColor: "#56F000" }}
									icon={<CheckIcon style={{ color: "#56F000" }} />}
								/>
							);
						case PENDING:
							return (
								<>
									<Chip
										variant="outlined"
										label="Pending"
										size="small"
										style={{ color: "#FFB302", borderColor: "#FFB302" }}
										icon={<CachedIcon style={{ color: "#FFB302" }} />}
									/>
									<Tooltip title="Retry" arrow>
										<IconButton onClick={() => handleRetry(params.value.id)}>
											<ReplayIcon />
										</IconButton>
									</Tooltip>
								</>
							);
						case FAILED:
							return (
								<>
									<Chip
										variant="outlined"
										label="Failed"
										size="small"
										style={{ color: "#FF3838", borderColor: "#FF3838" }}
										icon={<CancelIcon style={{ color: "#FF3838" }} />}
									/>
									<Tooltip title="Retry" arrow>
										<IconButton onClick={() => handleRetry(params.value.id)}>
											<ReplayIcon />
										</IconButton>
									</Tooltip>
								</>
							);
						default:
							break;
					}
				},
			},
			{
				field: "createdAt",
				sortable: false,
				headerName: "Added On",
				flex: 1,
			},
			...(is_god //TODO: Enable for all users
				? [
						{
							field: "delete",
							sortable: false,
							headerName: "Delete",
							flex: 1,
							renderCell: (params) => {
								return params?.value ? (
									<IconButton
										color="secondary"
										onClick={() => handleDelete({ source_url: params?.value })}
									>
										<Delete />
									</IconButton>
								) : (
									<></>
								);
							},
						},
					]
				: []),
		],
		[handleDelete, handleRetry, is_god]
	);

	const rows = useMemo(
		() =>
			tasks.map((task) => ({
				id: task.id,
				createdAt: new Date(task.created_at).toLocaleDateString(),
				status: { status: task.status, id: task.id },
				type: types[task.type],
				title: task.data,
				delete: task.url,
			})),
		[tasks]
	);
	return (
		<MuiDialog
			open={openTasksDialog}
			onClose={handleClose}
			title="Data Training Status"
			width="900px"
		>
			<div
				style={{
					height: 400,
					width: "100%",
					minWidth: "600px",
					overflowX: "scroll",
					overflowY: "hidden",
				}}
			>
				<DataGrid
					rows={rows}
					columns={columns}
					pageSize={10}
					loading={loading}
					disableSelectionOnClick
					disableRowSelectionOnClick
					hideFooter
					slots={{
						noRowsOverlay: CustomNoRowsOverlay,
					}}
					slotProps={{
						noRowsOverlay: { title: "No Data Added for training" },
					}}
					disableColumnMenu
					disableColumnFilter
				/>
			</div>
			<Stack spacing={2} alignItems="center" my={1}>
				<Pagination
					page={page}
					count={count}
					sx={{ m: "10px auto" }}
					color="primary"
					onChange={handlePageChange}
				/>
			</Stack>
		</MuiDialog>
	);
};

export default withErrorBoundary(
	ViewTrainingStatusDialog,
	"ViewTrainingStatusDialog"
);
