import { Box, MenuItem, TextField } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import axios from "axios";
import { useApiCall } from "components/common/appHooks";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { useOrgContext } from "context/OrgContext";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const Analytics = () => {
	const axiosCancelSource = axios.CancelToken.source();
	const { org } = useOrgContext();
	const { Get } = useApiCall();
	// creating random data from loading
	const [data, setData] = useState(() =>
		[...Array(4)]
			.map((_, index) => ({
				week_start: dayjs()
					.subtract(index, "week")
					.startOf("week")
					.format("YYYY-MM-DD"),
				actions_initiated: Math.floor(Math.random() * 100),
				incorrect_answers: Math.floor(Math.random() * 10),
				unanswered_queries: Math.floor(Math.random() * 15),
				upvotes_received: Math.floor(Math.random() * 50),
			}))
			.reverse()
	);
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState("1 month");
	// const filteredData = useMemo(() => {
	// 	const today = dayjs();
	// 	let startDate;

	// 	switch (timeRange) {
	// 		case "1 week":
	// 			startDate = today.subtract(1, "week");
	// 			break;
	// 		case "1 month":
	// 			startDate = today.subtract(1, "month");
	// 			break;
	// 		case "3 months":
	// 			startDate = today.subtract(3, "month");
	// 			break;
	// 		case "6 months":
	// 			startDate = today.subtract(6, "month");
	// 			break;
	// 		case "all time":
	// 		default:
	// 			return data;
	// 	}

	// 	return data.filter((item) => dayjs(item.week_start).isAfter(startDate));
	// }, [data, timeRange]);

	const handleChange = (event) => {
		setTimeRange(event.target.value);
	};

	async function getAnalytics() {
		try {
			const today = dayjs();
			let startDate;

			switch (timeRange) {
				case "1 week":
					startDate = today.subtract(1, "week");
					break;
				case "1 month":
					startDate = today.subtract(1, "month");
					break;
				case "3 months":
					startDate = today.subtract(3, "month");
					break;
				case "6 months":
					startDate = today.subtract(6, "month");
					break;
				case "all time":
				default:
					break;
			}
			setLoading(true);
			const response = await Get(
				1,
				"analytics",
				{
					start_date: startDate ? startDate.toISOString() : undefined,
					end_date: today.toISOString(),
				},
				axiosCancelSource.token
			);
			setData(response.data.data);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
			setData([]);
			toast.error(error.message);
		}
	}

	useEffect(() => {
		getAnalytics();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [org.id, timeRange]);

	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			gap={2}
			flexWrap="wrap"
		>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				flex={1}
				m={4}
			>
				<TextField
					select
					value={timeRange}
					onChange={handleChange}
					label="Time Range"
					style={{ marginBottom: "16px", minWidth: 200 }}
				>
					<MenuItem value="1 week">1 Week</MenuItem>
					<MenuItem value="1 month">1 Month</MenuItem>
					<MenuItem value="3 months">3 Months</MenuItem>
					<MenuItem value="6 months">6 Months</MenuItem>
					<MenuItem value="all time">All Time</MenuItem>
				</TextField>
				<BarChart
					loading={loading}
					dataset={data}
					xAxis={[
						{
							scaleType: "band",
							dataKey: "week_start",
							label: "Week Starting Date",
							valueFormatter: (value) => new Date(value).toLocaleDateString(),
						},
					]}
					series={[
						{ dataKey: "actions_initiated", label: "Actions Initiated" },
						{ dataKey: "incorrect_answers", label: "Incorrect Answers" },
						{ dataKey: "unanswered_queries", label: "Unanswered Queries" },
						{ dataKey: "upvotes_received", label: "Upvotes Received" },
					]}
					// width={500}
					height={500}
					yAxis={[
						{
							min: loading ? 0 : undefined,
							max: loading ? 100 : undefined,
							label: "count",
						},
					]}
				/>
			</Box>
		</Box>
	);
};

export default withErrorBoundary(Analytics, "Analytics");
