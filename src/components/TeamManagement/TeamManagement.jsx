import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./TeamManagement.module.css";
import { Button, Chip, IconButton, Typography } from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import axios from "axios";
import { SmallLoader } from "components/common/NewLoader";
import AddNewMember from "./AddNewMember";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import {
	ORG_ADMIN,
	ORG_ADMIN_ID,
	ORG_EDITOR,
	ORG_EDITOR_ID,
	ORG_SALES,
	ORG_SALES_ID,
	ORG_VIEWER,
	ORG_VIEWER_ID,
	ORG_META_EDITOR,
	ORG_META_EDITOR_ID,
	ORG_META_VIEWER,
	ORG_META_VIEWER_ID,
	REQUEST_CANCELED_MESSAGE,
	PLAN_UNLIMITED,
	PLANS_LIMIT_REACHED,
} from "components/common/constants";
import { useOrgContext } from "context/OrgContext";
import Swal from "sweetalert2/dist/sweetalert2";
import { usePlanContext } from "context/PlanContext";
import { useUserContext } from "context/UserContext";
import team from "staticData/team.json"
const TeamManagement = () => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const { org } = useOrgContext();
	const {
		user: { is_god },
	} = useUserContext();
	const { plan } = usePlanContext();

	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [addNewMemberDialogOpen, setAddNewMemberDialogOpen] = useState(false);

	const getRole = useCallback((role_id) => {
		switch (role_id) {
			case ORG_ADMIN_ID:
				return ORG_ADMIN;
			case ORG_VIEWER_ID:
				return ORG_VIEWER;
			case ORG_EDITOR_ID:
				return ORG_EDITOR;
			case ORG_SALES_ID:
				return ORG_SALES;
			case ORG_META_EDITOR_ID:
				return ORG_META_EDITOR;
			case ORG_META_VIEWER_ID:
				return ORG_META_VIEWER;
			default:
				break;
		}
	}, []);

	async function getTeamMembers() {
		try {
			setLoading(true);
			// const response = await Get(
			// 	1,
			// 	"get_org_team",
			// 	undefined,
			// 	axiosCancelSource.token
			// );
			setMembers(team.data);
			setLoading(false);
		} catch (error) {
			if (error.message !== REQUEST_CANCELED_MESSAGE) setLoading(false);
		}
	}

	useEffect(() => {
		getTeamMembers();

		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [org.host_url]);

	const onDelete = useCallback(
		async ({ name, user_id }) => {
			try {
				const result = await Swal.fire({
					title: `Are you sure?`,
					text: `${name} will no longer have access to this Org`,
					icon: "warning",
					showCancelButton: true,
				});
				if (result.isConfirmed) {
					await Post(1, "delete_org_user", { user_id });
					setMembers((prev) => prev.filter((member) => member.id !== user_id));
					toast.success(`Removed ${name} from Org`);
				}
			} catch (error) {}
		},
		[Post]
	);

	const handleRoleDelete = useCallback(
		async ({ name, user_id, role_id }) => {
			const result = await Swal.fire({
				title: `Are you Sure?`,
				text: `${getRole(role_id)} role will be removed from ${name}`,
				icon: "warning",
				showCancelButton: true,
			});
			if (result.isConfirmed) {
				await Post(1, "delete_role_for_org_user", { user_id, role_id });
				setMembers((prev) =>
					prev.map((member) =>
						member.id === user_id
							? {
									...member,
									role_ids: member.role_ids.filter((role) => role !== role_id),
								}
							: member
					)
				);
				toast.success(`Removed ${getRole(role_id)} role from ${name}`);
			}
		},
		[Post, getRole]
	);
	async function handleOpenAddNewMemberDialog() {
		if (
			plan.members !== PLAN_UNLIMITED &&
			members.length >= plan.members &&
			!is_god
		) {
			return toast.info(PLANS_LIMIT_REACHED);
		}
		setAddNewMemberDialogOpen(true);
	}

	return (
		<div className={styles.container}>
			<Button
				variant="contained"
				color="primary"
				onClick={handleOpenAddNewMemberDialog}
			>
				Add New Member
			</Button>
			<Typography variant="h2">Members</Typography>
			<div className={styles.members_container}>
				{loading ? (
					<SmallLoader width="300px" />
				) : members.length ? (
					members.map((member) => (
						<React.Fragment key={member.id}>
							<Card>
								<CardHeader
									avatar={
										<Avatar
											alt={member.name}
											src={`https://api.dicebear.com/5.x/micah/svg?seed=${member.id}`}
										/>
									}
									// TODO: dont delete self, dont delete Creator, Editors cant remove Admins
									action={
										<IconButton
											aria-label="delete"
											onClick={() =>
												onDelete({
													name: member.name,
													user_id: member.id,
												})
											}
											size="large"
										>
											<DeleteIcon color="secondary" />
										</IconButton>
									}
									title={
										<>
											{member.name}{" "}
											{member.role_ids.map((role_id, _, arr) => (
												<>
													<Chip
														key={`${member.id}_${role_id}`}
														color="primary"
														disabled={false}
														variant="outlined"
														label={getRole(role_id)}
														size="small"
														onDelete={
															role_id !== ORG_ADMIN_ID && arr.length > 1
																? () =>
																		handleRoleDelete({
																			name: member.name,
																			user_id: member.id,
																			role_id: role_id,
																		})
																: undefined
														}
													/>{" "}
												</>
											))}
										</>
									}
									subheader={member.email}
								/>
							</Card>
						</React.Fragment>
					))
				) : (
					<Typography variant="h3">No Member has been added</Typography>
				)}
			</div>
			<AddNewMember
				open={addNewMemberDialogOpen}
				onClose={() => {
					getTeamMembers();
					setAddNewMemberDialogOpen(false);
				}}
			/>
		</div>
	);
};

export default withErrorBoundary(TeamManagement, "TeamManagement");
