import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Button, Tooltip, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import axios from "axios";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from "react-sortable-hoc";
import MenuIcon from "@mui/icons-material/Menu";
import { arrayMoveImmutable } from "array-move";
import { toast } from "react-toastify";

const AddBusinessActionDialog = lazy(() => import("./AddBusinessActionDialog"));

const BusinessActions = () => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const { businessActions, setBusinessAction } = useChatConfigContext();
	const [addBusinessActionDialogOpen, setAddBusinessActionDialogOpen] =
		useState(false);

	const handleCloseAddBusinessActionDialog = async () => {
		setAddBusinessActionDialogOpen(false);
	};

	const deleteBusinessAction = useCallback(async (id) => {
		try {
			await Post(1, `actions/change-visibility/${id}`, { visibility: 0 });
			setBusinessAction((prev) => prev.filter((action) => action.id !== id));
		} catch (error) {
			console.error(error);
		}
	}, []);

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

	const handleBusinessActionSort = async ({ oldIndex, newIndex }) => {
		// console.log({ oldIndex, newIndex });
		try {
			setBusinessAction((prev) => arrayMoveImmutable(prev, oldIndex, newIndex));
			await Post(1, "actions/reorder", {
				action_id: businessActions[oldIndex]?.id,
				old_order: businessActions[oldIndex]?.ordering,
				new_order: businessActions[newIndex]?.ordering,
			});
			getActions();
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message ?? "Something went wrong");
			} else toast.error("Something went wrong");
			setBusinessAction(businessActions);
		}
	};

	useEffect(() => {
		getActions();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, []);

	return (
		<>
			<div>
        <label htmlFor="positionBottom">Business Action</label><br/>
        <Typography variant="subtitle2">Only First 3 will be visible in the dropdown menu in chatbot</Typography>
			</div>
			{businessActions?.length > 0 && (
				<SortableBusinessActions
					businessActions={businessActions}
					deleteBusinessAction={deleteBusinessAction}
					onSortEnd={handleBusinessActionSort}
					useDragHandle
				/>
			)}
			<br />
			<Button
				color="primary"
				variant="outlined"
				endIcon={<AddCircleIcon />}
				onClick={() => setAddBusinessActionDialogOpen(true)}
			>
				Add Action
			</Button>
			<Suspense fallback={<></>}>
				<AddBusinessActionDialog
					open={addBusinessActionDialogOpen}
					onClose={handleCloseAddBusinessActionDialog}
				/>
			</Suspense>
		</>
	);
};

const SortableBusinessActions = SortableContainer(
	({ businessActions, deleteBusinessAction }) => {
		return (
			<div>
				{businessActions?.map((businessAction, index) => {
					return (
						<BusinessAction
							{...businessAction}
							deleteBusinessAction={deleteBusinessAction}
							key={businessAction.id}
							index={index}
						/>
					);
				})}
			</div>
		);
	}
);
const BusinessAction = SortableElement(
	({ name, type, deleteBusinessAction, detail, ...businessAction }) => {
		// TODO: add sorting, add edit
		return (
			<div
				className="question"
				style={{ zIndex: 99999999, margin: "12px 0px" }}
			>
				<div style={{ display: "flex", alignItems: "center" }}>
					<DragHandle />

					<div>
						<Typography variant="body1">{name}</Typography>
						{/* TODO: Check if type is Button, MCQ, etc */}
						<Typography variant="subtitle2">{detail?.link}</Typography>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: 5,
						justifyContent: "center",
					}}
				>
					{/* TODO: Add Edit Button, on edit add a new action and disable the old one */}
					{/* <Button
						variant="outlined"
						color="primary"
						onClick={() => openEditBusinessAction(businessAction.id)}
					>
						Edit
					</Button> */}
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => deleteBusinessAction(businessAction.id)}
					>
						Delete
					</Button>
				</div>
			</div>
		);
	}
);

const DragHandle = SortableHandle(() => (
	<Tooltip title="Click and Drag to Change Order">
		<MenuIcon sx={{ color: "gray", mr: 2 }} />
	</Tooltip>
));

export default withErrorBoundary(BusinessActions, "BusinessActions");
