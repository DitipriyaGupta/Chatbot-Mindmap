import MuiDialog from "components/common/MuiDialog";
import { usePlanContext } from "context/PlanContext";
import React, { useState } from "react";
import {
	NOT_AVAILABLE_IN_PLAN,
	PLAN_UNLIMITED,
} from "components/common/constants";
import { useUserContext } from "context/UserContext";
import { toast } from "react-toastify";
import {
	Box,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { subDays, subMonths } from "date-fns";
import dayjs from "dayjs";

const ExportLeadsDialog = ({ open, onClose, leads }) => {
	const { Post } = useApiCall();
	const TODAY = "today";
	const WEEK = "week";
	const MONTH = "month";
	const ALL = "all";
	const CUSTOM = "custom";

	const { plan } = usePlanContext();
	const {
		user: { is_god },
	} = useUserContext();

	const [requestCSVLoading, setRequestCSVLoading] = useState(false);
	const [value, setValue] = useState(TODAY);
	const [startDate, setStartDate] = useState(dayjs(new Date().toDateString()));
	const [endDate, setEndDate] = useState(dayjs(new Date().toDateString()));

	const handleCustomDateChange = (event) => {
		switch (event.target.value) {
			case TODAY:
				setStartDate(dayjs(new Date()));
				setEndDate(dayjs(new Date()));
				break;
			case WEEK:
				setStartDate(dayjs(subDays(new Date(), 7)));
				setEndDate(dayjs(new Date()));
				break;
			case MONTH:
				setStartDate(dayjs(subMonths(new Date(), 1)));
				setEndDate(dayjs(new Date()));

				break;
			case ALL:
				setStartDate(null);
				setEndDate(null);
				break;
			case CUSTOM:
				setStartDate(dayjs(new Date()));
				setEndDate(dayjs(new Date()));
				break;

			default:
				break;
		}
		setValue(event.target.value);
	};

	async function requestCSV() {
		if (
			plan.leads !== PLAN_UNLIMITED &&
			leads.length >= plan.leads &&
			!is_god
		) {
			return toast.info(NOT_AVAILABLE_IN_PLAN);
		}
		setRequestCSVLoading(true);

		try {
			await Post(1, "leads_to_csv_and_save", {
				start_date: startDate?.format("YYYY-MM-DD"),
				end_date: endDate?.format("YYYY-MM-DD"),
			});
			onClose();
			toast.success(
				<>
					<Typography variant="body1">Processing Leads Data!</Typography>
					<Typography variant="subtitle2">
						You will receive an email once it's completed
					</Typography>
				</>
			);
		} catch (error) {
			toast.error(error?.response?.data?.message ?? "Something went wrong");
		} finally {
			setRequestCSVLoading(false);
		}
	}
	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			onSubmit={requestCSV}
			submitDisabled={requestCSVLoading}
			submitButtonText="Export"
			title="Export CSV"
		>
			<FormControl variant="standard" component="fieldset">
				<RadioGroup
					aria-label="options"
					name="options1"
					value={value}
					onChange={handleCustomDateChange}
					style={{
						display: "flex",
						gap: 5,
						flexWrap: "wrap",
						flexDirection: "row",
					}}
				>
					<FormControlLabel
						value={TODAY}
						control={<Radio />}
						label={"Last 24 Hours"}
						color="primary"
					/>
					<FormControlLabel
						value={WEEK}
						control={<Radio />}
						label={"Last Week"}
						color="primary"
					/>
					<FormControlLabel
						value={MONTH}
						control={<Radio />}
						label={"Last Month"}
						color="primary"
					/>
					<FormControlLabel
						value={ALL}
						control={<Radio />}
						label={"All"}
						color="primary"
					/>
					<FormControlLabel
						value={CUSTOM}
						control={<Radio />}
						label={"Custom"}
						color="primary"
					/>
				</RadioGroup>
			</FormControl>
			{value === CUSTOM ? (
				<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Start Date"
							value={startDate}
							onChange={(newDate) => {
								setStartDate(newDate);
								setValue(CUSTOM);
							}}
						/>
						<DatePicker
							label="End Date"
							value={endDate}
							onChange={(newDate) => {
								setEndDate(newDate);
								setValue(CUSTOM);
							}}
						/>
					</LocalizationProvider>
				</Box>
			) : null}
		</MuiDialog>
	);
};

export default withErrorBoundary(ExportLeadsDialog, "ExportLeadsDialog");
