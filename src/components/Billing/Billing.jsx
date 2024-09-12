import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import axios from "axios";
import { useApiCall } from "components/common/appHooks";
import { SmallLoader } from "components/common/NewLoader";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import EditIcon from "@mui/icons-material/Edit";
import { useOrgContext } from "context/OrgContext";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	CREDIT_CATEGORY_PROMOTIONAL,
	PLAN_UNLIMITED,
} from "components/common/constants";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import { Button } from "@mui/material";
import Swal from "sweetalert2/dist/sweetalert2";
import { intlFormatDistance } from "date-fns";

const EditSubscriptionDialog = lazy(() => import("./EditSubscriptionDialog"));

const Billing = () => {
	const axiosCancelSource = axios.CancelToken.source();
	const { org } = useOrgContext();
	const { Get, Post } = useApiCall();
	// creating random data from loading
	const [subscription, setSubscription] = useState({});
	const [creditsHistory, setCreditsHistory] = useState([]);
	const [credits, setCredits] = useState({ amount: 0 });
	const [loading, setLoading] = useState(true);
	const [toggleEditSubscription, setToggleEditSubscription] = useState(false);

	// TODO Move to PlanContext
	async function getSubscription() {
		try {
			setLoading(true);
			const response = await Get(
				1,
				"get_org_subscription",
				undefined,
				axiosCancelSource.token
			);
			setSubscription(response.data.data);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
			setSubscription({});
			toast.error(error.message);
		}
	}
	async function getCreditsHistory() {
		try {
			const response = await Get(
				1,
				"credits/history",
				undefined,
				axiosCancelSource.token
			);
			setCreditsHistory(response.data.data);
		} catch (error) {
			console.error(error);
			setCreditsHistory([]);
			toast.error(error.message);
		}
	}
	async function getCredits() {
		try {
			const response = await Get(
				1,
				"get_org_credits",
				undefined,
				axiosCancelSource.token
			);
			setCredits(response.data.data);
		} catch (error) {
			console.error(error);
			setCredits(0);
			toast.error(error.message);
		}
	}

	// async function handleRecordPayment() {
	// 	const { value: amount } = await Swal.fire({
	// 		title: "Enter Payment Amount",
	// 		input: "number",
	// 		inputValue: pendingPayment.total,
	// 		showCancelButton: true,
	// 		inputValidator: (value) => {
	// 			if (!value) {
	// 				return "You need to write an amount!";
	// 			}
	// 		},
	//   });

	// }

	// async function handlePayment(params) {
	// 	return Post(1, "update_pending_payments", params);
	// }

	async function toggleUpdateSubscription(set, update = false) {
		if (update === true) {
			getDetails();
		}
		setToggleEditSubscription((prev) =>
			typeof set === "boolean" ? set : !prev
		);
	}

	async function addCredits() {
		const { value: amount } = await Swal.fire({
			title: "Enter Amount",
			input: "number",
			inputLabel: "How many credits do you want to add?",
			showCancelButton: true,
			inputValidator: (value) => {
				if (!value) {
					return "You need to write something!";
				}
			},
		});
		if (amount) {
			try {
				const response = await Post(1, "credits/update", {
					amount,
					credit_category_id: CREDIT_CATEGORY_PROMOTIONAL,
				});
				setCredits(response.data.data);
				getCreditsHistory();
			} catch (error) {
				console.error(error);
				toast.error(error.message);
			}
		}
	}
	async function getDetails() {
		getSubscription();
		getCredits();
		getCreditsHistory();
	}
	useEffect(() => {
		getDetails();
	}, [org.id]);

	const {
		total_chats,
		used_chats,
		total_leads,
		used_leads,
		total_members,
		used_members,
		total_training,
		used_training,
		live_chat,
		whatsapp,
		branding,
		start_date,
		end_date,
	} = subscription;

	const formatValue = (value) =>
		value === PLAN_UNLIMITED ? "Unlimited" : value;
	if (loading) return <SmallLoader />;
	return (
		<>
			<Card
				sx={{
					maxWidth: 275,
					margin: "auto",
					mt: 4,
					boxShadow: 3,
					borderRadius: 2,
				}}
			>
				<CardContent>
					<Typography variant="h5" component="div">
						{credits.amount}
					</Typography>
					<Typography color="text.secondary">Total Dues</Typography>
				</CardContent>
				{/* <CardActions>
					<Button size="small" onClick={addCredits}>
						Add Credits
					</Button>
				</CardActions> */}
			</Card>
			<Card
				sx={{
					maxWidth: 800,
					margin: "auto",
					mt: 4,
					boxShadow: 3,
					borderRadius: 2,
				}}
			>
				<CardContent>
					<Typography
						variant="h5"
						component="div"
						color="primary"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						Current Plan:{" "}
						{subscription.details?.name ?? "No Subscription Active"}
						<Button onClick={toggleUpdateSubscription} endIcon={<EditIcon />}>
							Edit / Start New
						</Button>
					</Typography>
					<Divider sx={{ my: 2 }} />
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Box mb={2}>
								<Typography variant="body2">
									Total Chats: <strong>{formatValue(total_chats)}</strong>
								</Typography>
								<Typography variant="body2">
									Used Chats: <strong>{formatValue(used_chats)}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Total Leads: <strong>{formatValue(total_leads)}</strong>
								</Typography>
								<Typography variant="body2">
									Used Leads: <strong>{formatValue(used_leads)}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Total Members: <strong>{formatValue(total_members)}</strong>
								</Typography>
								<Typography variant="body2">
									Used Members: <strong>{formatValue(used_members)}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Total Training: <strong>{formatValue(total_training)}</strong>
								</Typography>
								<Typography variant="body2">
									Used Training: <strong>{formatValue(used_training)}</strong>
								</Typography>
							</Box>
						</Grid>
						<Grid item xs={6}>
							<Box mb={2}>
								<Typography variant="body2">
									Live Chat:{" "}
									<strong>{live_chat ? "Enabled" : "Not Enabled"}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									WhatsApp:{" "}
									<strong>{whatsapp ? "Enabled" : "Not Enabled"}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Branding Removed: <strong>{branding ? "Yes" : "No"}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Extra Training:{" "}
									<strong>{subscription.add_on_training}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Extra Members: <strong>{subscription.add_on_member}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									Start Date:{" "}
									<strong>{new Date(start_date).toLocaleDateString()}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant="body2">
									End Date:{" "}
									<strong>
										{new Date(end_date).toLocaleDateString()} (
										{intlFormatDistance(new Date(end_date), new Date())})
									</strong>
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
			<Card
				sx={{
					maxWidth: 800,
					margin: "auto",
					mt: 4,
					boxShadow: 3,
					borderRadius: 2,
				}}
			>
				<CardContent>
					<Typography variant="h5" component="div" color="primary">
						Credit History
					</Typography>
					<Divider sx={{ my: 2 }} />
					{/* <Grid container spacing={2}> */}
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Amount</TableCell>
									<TableCell>Type</TableCell>
									<TableCell>Name</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{creditsHistory.map((credit) => (
									<TableRow key={credit.id}>
										<TableCell>{credit.id}</TableCell>
										<TableCell>₹{credit.amount}</TableCell>
										<TableCell>{credit.type ? "Credit" : "Debit"}</TableCell>
										<TableCell>{credit?.credit_category?.name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					{/* </Grid> */}
				</CardContent>
			</Card>
			<Suspense fallback={<SmallLoader />}>
				{toggleEditSubscription ? (
					<EditSubscriptionDialog
						open={toggleEditSubscription}
						onClose={toggleUpdateSubscription}
						subscription={subscription}
					/>
				) : null}
			</Suspense>
		</>
	);
};

export default withErrorBoundary(Billing, "Billing");
