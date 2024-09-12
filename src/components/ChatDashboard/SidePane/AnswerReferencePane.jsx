import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import classNames from "classnames";
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useHistory, useLocation } from "react-router-dom";
import styles from "./SidePane.module.css";
import { DialogLoader, SmallLoader } from "../../common/NewLoader";
import {
	Box,
	Button,
	Grow,
	IconButton,
	LinearProgress,
	Popper,
	Tooltip,
	Typography,
} from "@mui/material";
import { Close, ExpandMore, ExpandLess } from "@mui/icons-material";
import axios from "axios";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CallMadeIcon from "@mui/icons-material/CallMade";
import Swal from "sweetalert2/dist/sweetalert2";
import { toast } from "react-toastify";
import { useApiCall } from "components/common/appHooks.js";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
// import { useUserContext } from "context/UserContext";
import { useOrgContext } from "context/OrgContext";
import BusinessAction from "../BusinessAction";

const JSONToHTML = lazy(() => import("components/common/JSONToHTML"));
const EditDataDialog = lazy(() => import("components/MindMap/EditDataDialog"));

const useStyles = makeStyles({
	root: {
		// flexGrow: 1,
		width: "100%",
		borderRadius: "8px",
	},
	tab: {
		minWidth: 0,
		padding: 0,
		width: 100,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "0.6rem 1rem",
		borderBottom: "2px solid var(--background)",
	},
	title: {
		fontWeight: "400",
		color: "var(--color5)",
		textTransform: "uppercase",
	},
	articleRoot: {
		padding: "0.6rem 1.2rem 0.6rem 1rem",
		position: "relative",
		borderBottom: "2px solid var(--background)",
	},
	refBody: {
		maxHeight: "calc(100vh - 150px)",
		overflowY: "auto",
	},
	showMoreButton: {
		display: "flex",
		margin: " 0 auto",
		marginTop: "0.5rem",
		"& .MuiButton-label": {
			// color: "var(--primary)",
		},
	},
	iconButton: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		borderRadius: "10px",
		width: "100%",
	},
	iconButtonLabel: {
		display: "block",
		fontSize: "10px",
		color: "gray",
	},
	optionsContainer: {
		display: "flex",
		flexDirection: "column",
		background: "white",
		borderRadius: "5px",
		boxShadow: "0 0 0 1px gray",
	},
});

function AnswerReferencePane() {
	// const [open, setOpen] = useState(false);
	const {
		org: { host_url },
	} = useOrgContext();
	const { Post, Get } = useApiCall();
	const [businessActions, setBusinessActions] = useState([]);
	const classes = useStyles();
	const history = useHistory();
	const location = useLocation();
	const axiosCancelSource = axios.CancelToken.source();
	const searchParams = useMemo(
		() => new URLSearchParams(location.search),
		[location.search]
	);
	const message_id = searchParams.get("show_answer_source") ?? false;
	const [vectorData, setVectorData] = useState([]);
	const [sources, setSources] = useState({});
	const [loading, setLoading] = useState(false);
	const [isVisible, setIsVisible] = useState(message_id);
	// Edit Dialog
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editData, setEditData] = useState(null);

	const handleOpenEditDialog = async (data) => {
		setEditData(data);
		// setEditDescription(description);
		setOpenEditDialog(true);
	};
	const handleCloseEditDialog = async () => {
		setOpenEditDialog(false);
		setEditData(null);
	};

	async function handleDelete(id) {
		try {
			const result = await Swal.fire({
				title: "Confirmation",
				text: "Are you sure you want to delete this data?",
				icon: "warning",
				showCancelButton: true,
			});

			if (result.isConfirmed) {
				// Call your delete API endpoint with the necessary parameters
				await Post(1, "delete_vector", { vector_id: id });

				// Update the originally mapped data
				setVectorData((prevData) =>
					prevData.filter((item) => item.vector_id !== id)
				);

				toast.success("Data has been deleted");
			}
		} catch (error) {
			console.error("Error deleting data:", error);
			toast.error("Failed to delete data.");
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
			setBusinessActions(
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
		if (message_id) {
			setIsVisible(message_id);
			setVectorData([]);
			setSources({});
			getMessageSource();
		}
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [message_id]);

	useEffect(() => {
		if (message_id) {
			getActions();
		}
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [host_url]);

	async function getMessageSource() {
		try {
			setLoading(true);
			const response = await Get(
				1,
				"fetch_contexts_through_msg_id",
				{ message_id },
				axiosCancelSource.token
			);
			setVectorData(response.data.data.vector_data);
			setSources({...response.data.data.sources, summary:response.data.data.chat_summary});
			setLoading(false);
		} catch (error) {
			if (error.message !== REQUEST_CANCELED_MESSAGE) setLoading(false);
		}
	}

	// BEGIN: ed8c6549bwf9 - This function closes the answer references pane and clears the sources array.
	const closeRefs = () => {
		setIsVisible(false);
		setVectorData([]);
		setSources([]);
		if (searchParams.has("show_answer_source")) {
			searchParams.delete("show_answer_source");
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}
	};

	return (
		<div
			className={classNames(styles.rightChatContainer, {
				[styles.open]: isVisible,
			})}
		>
			<div className={classes.header}>
				<Typography variant="body1" className={classes.title}>
					Answer Sources
				</Typography>
				<Tooltip title="Close">
					<IconButton
						size="medium"
						color="inherit"
						aria-label="close"
						component="button"
						onClick={closeRefs}
					>
						<Close />
					</IconButton>
				</Tooltip>
			</div>
			<div className={classes.refBody}>
				{loading ? (
					<SmallLoader />
				) : vectorData.length === 0 ? (
					<>No Source Found</>
				) : (
					<>
						{vectorData.map((source) => (
							<Reference
								key={source.vector_id}
								{...{
									source,
									handleOpenEditDialog,
									handleDelete,
									businessActions,
								}}
							/>
						))}
						{/* TODO: see a solution to check if isGod or is Meta user from one common place, preferable from backend */}
						{sources ? (
							<Box
								component="pre"
								sx={{
									textWrap: "pretty",
									borderRadius: "8px",
									m: 2,
									p: 1,
								}}
							>
								<Suspense fallback={<SmallLoader />}>
									<JSONToHTML data={{ ...sources, vectors_info: undefined }} />
								</Suspense>
							</Box>
						) : null}
					</>
				)}
			</div>
			<Suspense fallback={<DialogLoader />}>
				{openEditDialog && editData ? (
					<EditDataDialog
						{...{
							editData,
							setData: setVectorData,
							openEditDialog,
							setOpenEditDialog,
							handleCloseEditDialog,
						}}
					/>
				) : null}
			</Suspense>
		</div>
	);
}

const Reference = ({
	source,
	handleOpenEditDialog,
	handleDelete,
	businessActions,
}) => {
	const {
		vector_id,
		metadata: {
			read_more_link,
			score,
			text,
			source_url,
			read_more_label = "Read More",
			action_id,
      active=true,
		},
	} = source;
	const classes = useStyles();
	const isSourceUrlValid = useMemo(() => {
		try {
			new URL(source_url);
			return true;
		} catch (error) {
			return false;
		}
	}, [source_url]);
	const isReadMoreUrlValid = useMemo(() => {
		try {
			new URL(read_more_link);
			return true;
		} catch (error) {
			return false;
		}
	}, [read_more_link]);

	const [isShowMoreToggle, setIsShowMoreToggle] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = async (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	async function handleSourceClick() {
		window.open(source_url, "_blank");
	}
	return (
		<div className={classes.articleRoot}>
			<Typography variant="subtitle1" component="span" sx={{whiteSpace:"break-spaces"}}>
				ID {vector_id}:&nbsp;
				{!active ? "This Data has been deleted\n\n" :""}
				{text.length > 180 && !isShowMoreToggle ? (
					`${text.slice(0, 180)}...`
				) : isReadMoreUrlValid ? (
					<>
						{text}{" "}
						<a
							style={{ textDecoration: "underline" }}
							target="_blank"
							href={read_more_link}
							rel="noreferrer"
						>
							{read_more_label || "Read More"}
						</a>
					</>
				) : (
					text
				)}
			</Typography>
			{isShowMoreToggle ? (
				<>
					{!isNaN(Number(score * 100)) ? (
						<LinearProgressWithLabel value={score * 100} />
					) : null}
					{isSourceUrlValid ? (
						<Button
							// variant="text"
							className={classes.showMoreButton}
							endIcon={<CallMadeIcon />}
							onClick={handleSourceClick}
							color="secondary"
						>
							Visit Source Page
						</Button>
					) : null}
					{Number(action_id) &&
					businessActions.some((action) => action.id === Number(action_id)) ? (
						<BusinessAction
							action={businessActions.find(
								(action) => action.id === Number(action_id)
							)}
						/>
					) : null}
				</>
			) : (
				<></>
			)}
			<Button
				variant="text"
				className={classes.showMoreButton}
				color="primary"
				endIcon={isShowMoreToggle ? <ExpandLess /> : <ExpandMore />}
				onClick={() => setIsShowMoreToggle((prev) => !prev)}
			>
				{isShowMoreToggle ? "Show Less" : "Show More"}
			</Button>
			<IconButton
				style={{ position: "absolute", top: 10, right: 0, padding: 0 }}
				onClick={handleClick}
        size="large"
        disabled={!active}
			>
				<MoreVertIcon />
			</IconButton>
			<Popper
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				transition
				disablePortal
				modifiers={{
					arrow: {
						enabled: true,
						element: anchorEl,
					},
				}}
			>
				{({ TransitionProps }) => (
					<Grow {...TransitionProps}>
						<div className={classes.optionsContainer}>
							<Tooltip title="Edit" arrow>
								<span>
									<IconButton
										classes={{ root: classes.iconButton }}
										disabled={!vector_id}
										size="large"
										onClick={() => handleOpenEditDialog(source)}
									>
										<EditIcon classes={{ root: classes.iconRoot }} />
										<span className={classes.iconButtonLabel}>Edit</span>
									</IconButton>
								</span>
							</Tooltip>
							<Tooltip title="Delete" arrow>
								<span>
									<IconButton
										classes={{ root: classes.iconButton }}
										disabled={!vector_id}
										size="large"
										onClick={() => handleDelete(vector_id)}
									>
										<DeleteIcon classes={{ root: classes.iconRoot }} />
										<span className={classes.iconButtonLabel}>Delete</span>
									</IconButton>
								</span>
							</Tooltip>
						</div>
					</Grow>
				)}
			</Popper>
		</div>
	);
};

export default withErrorBoundary(AnswerReferencePane, "AnswerReferencePane");

function LinearProgressWithLabel(props) {
	return (
		<Box display="flex" alignItems="center">
			<Box width="100%">
				<br />
				<Typography variant="subtitle2">
					Relevance Score- {`${Math.round(props.value)}%`}
				</Typography>
				<LinearProgress
					color={props.value < 25 ? "secondary" : "primary"}
					variant="determinate"
					{...props}
				/>
			</Box>
		</Box>
	);
}
