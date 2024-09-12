import { Grid, MenuItem } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import compareObj from "components/common/compareObj";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2/dist/sweetalert2";

const EditSubscriptionDialog = ({
	open,
	onClose,
	subscription = {
		id: NaN,
		organization_id: NaN,
		total_chats: -1,
		used_chats: -1,
		total_leads: -1,
		used_leads: -1,
		total_members: -1,
		used_members: -1,
		total_training: -1,
		used_training: -1,
		live_chat: 0,
		whatsapp: 0,
		branding: 0,
		add_on_member: 0,
		add_on_training: 0,
		expires_at: "2024-06-10 07:01:42",
		start_date: null,
		end_date: null,
	},
}) => {
	const { Post, Get } = useApiCall();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
		control,
		watch,
	} = useForm({
		defaultValues: subscription,
	});
	const startDate = useWatch({ control, name: "start_date" });

	const [subscriptions, setSubscriptions] = useState([]);

	const editSubscription = async (params) => {
		if (params.start_new) {
			const result = await Swal.fire({
				title: `Are you sure?`,
				text: `The Current subscription will end an new will be started`,
				icon: "warning",
				showCancelButton: true,
			});
			if (!result.isConfirmed) {
				return;
			}
		}
		try {
			await Post(1, "update_subscription", {
				...compareObj({ ...subscription, start_new: false }, params),
			});
			toast.success("Subscription Edited Successfully!");
			resetForm();
			onClose(false, true);
		} catch (error) {
			toast.error(error.message || "Something Went Wrong");
		}
	};

	async function getAllSubscriptions() {
		try {
			const response = await Get(1, "subscriptions/view_all");
			setSubscriptions(response.data.data);
		} catch (error) {}
	}
	useEffect(() => {
		getAllSubscriptions();
	}, []);

	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			onSubmit={handleSubmit(editSubscription)}
			title="Edit Subscription"
		>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="subtitle2">-1 means unlimited</Typography>
				</Grid>
				<Grid item xs={12}>
					<TextField
						{...register("subscription_id")}
						select
						label="Subscription Plan"
						defaultValue={subscription.details.id}
						sx={{ width: "100%" }}
					>
						{subscriptions.map((subscription) => (
							<MenuItem value={subscription.id} key={subscription.id}>
								Id {subscription.id} {subscription.name} - ₹
								{parseInt(subscription.price)}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Total Chats"
						{...register("total_chats", {})}
						error={errors?.total_chats?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.total_chats?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Used Chats"
						disabled
						{...register("used_chats", {})}
						error={errors?.used_chats?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.used_chats?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Total Leads"
						{...register("total_leads", {})}
						error={errors?.total_leads?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.total_leads?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Used Leads"
						disabled
						{...register("used_leads", {})}
						error={errors?.used_leads?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.used_leads?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Total Members"
						{...register("total_members", {})}
						error={errors?.total_members?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.total_members?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Used Members"
						disabled
						{...register("used_members", {})}
						error={errors?.used_members?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.used_members?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Total Training"
						{...register("total_training", {})}
						error={errors?.total_training?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.total_training?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Used Training"
						disabled
						{...register("used_training", {})}
						error={errors?.used_training?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.used_training?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Addon Members"
						{...register("add_on_member", {})}
						error={errors?.add_on_member?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.add_on_member?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						label="Add On Training"
						{...register("add_on_training", {})}
						error={errors?.add_on_training?.type}
						fullWidth
						type="number"
						inputMode="numeric"
						onWheel={(event) => event.target.blur()}
						helperText={errors?.add_on_training?.message}
						placeholder=""
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<Controller
							control={control}
							name="start_date"
							rules={{
								required: {
									value: true,
									message: "Start date is required",
								},
							}}
							render={({ field: { onChange, value, ref } }) => (
								<DatePicker
									label="Start Date"
									onChange={onChange}
									onAccept={onChange}
									value={dayjs(value)}
									inputRef={ref}
									sx={{ width: "100%" }}
								/>
							)}
						/>
					</LocalizationProvider>
				</Grid>
				<Grid item xs={12} sm={6}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<Controller
							control={control}
							name="end_date"
							rules={{
								required: {
									value: true,
									message: "End date is required",
								},
							}}
							render={({ field: { onChange, value, ref } }) => (
								<DatePicker
									label="End Date"
									onChange={onChange}
									onAccept={onChange}
                  minDate={dayjs(startDate)}
									value={dayjs(value)}
									inputRef={ref}
									sx={{ width: "100%" }}
								/>
							)}
						/>
					</LocalizationProvider>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Controller
						control={control}
						name="live_chat"
						render={({ field: { onChange, value } }) => (
							<FormControlLabel
								control={<Checkbox onChange={onChange} checked={value} />}
								label="Enable Live Chat"
							/>
						)}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Controller
						control={control}
						name="whatsapp"
						render={({ field: { onChange, value } }) => (
							<FormControlLabel
								control={<Checkbox onChange={onChange} checked={value} />}
								label="Enable Whatsapp Chat"
							/>
						)}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Controller
						control={control}
						name="branding"
						render={({ field: { onChange, value } }) => (
							<FormControlLabel
								control={<Checkbox onChange={onChange} checked={value} />}
								label="Remove Branding"
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Controller
						control={control}
						name="start_new"
						render={({ field: { onChange, value } }) => (
							<FormControlLabel
								control={<Checkbox onChange={onChange} checked={value} />}
								label="Start New from Today"
							/>
						)}
					/>
				</Grid>
			</Grid>
		</MuiDialog>
	);
};

export default withErrorBoundary(
	EditSubscriptionDialog,
	"EditSubscriptionDialog"
);
