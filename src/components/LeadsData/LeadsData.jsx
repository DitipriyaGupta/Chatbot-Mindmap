import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	DataGrid,
	getGridNumericOperators,
	getGridStringOperators,
} from "@mui/x-data-grid";
import axios from "axios";
import { useApiCall } from "components/common/appHooks.js";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import { Link, useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useOrgContext } from "context/OrgContext";
import { IconButton, Tooltip } from "@mui/material";
import AIAnalysis from "./AIAnalysis";
import {
	PLAN_UNLIMITED,
	REQUEST_CANCELED_MESSAGE,
} from "components/common/constants";
import { usePlanContext } from "context/PlanContext";
import { useUserContext } from "context/UserContext";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Lead from "./Lead";
import leadsData from "../../staticData/leads.json"
const ExportLeadsDialog = lazy(() => import("./ExportLeadsDialog"));
const CustomNoRowsOverlay = lazy(
	() => import("components/common/CustomNoRowsOverlay")
);

const LeadData = () => {
	const { Get } = useApiCall();
	const { org } = useOrgContext();
	const { plan } = usePlanContext();
	const theme = useTheme();
	const isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const {
		user: { is_god },
	} = useUserContext();
	const axiosCancelSource = axios.CancelToken.source();
	const [loading, setLoading] = useState(true);
	const [isExportCSVDialogOpen, setIsExportCSVDialogOpen] = useState(false);
	const location = useLocation();
	const history = useHistory();
	const query = new URLSearchParams(location.search);
	const page = parseInt(query.get("page") || "1", 10);
	// TODO: add per page logic
	const per_page = parseInt(query.get("per_page") || 10, 10);
	const filter_by = query.get("filter_by") || undefined;
	const filter = query.get("filter") || undefined;
	const sort_by = query.get("sort_by") || undefined;
	const sort_direction = query.get("sort_direction") || undefined;
	const [count, setCount] = useState(1);
	const [leads, setLeads] = useState([
		// {
		// 	chat_id: 1,
		// 	created_by: 6,
		// 	lead_score: 0,
		// 	created_at: "2023-03-23T21:42:21.000000Z",
		// 	creator: {
		// 		id: 6,
		// 		name: "Shone",
		// 		email: "shonejogi2000@gmail.com",
		// 		phone: null,
		// 		city: null,
		// 		country: null,
		// 	},
		// },
	]);
	const updateAnalysis = useCallback((chat_id, lead_score) => {
		setLeads((prevLeads) =>
			prevLeads.map((lead) =>
				lead.chat_id === chat_id ? { ...lead, lead_score } : lead
			)
		);
	}, []);

	async function openExportLeadsDialog() {
		setIsExportCSVDialogOpen(true);
	}
	async function closeExportLeadsDialog() {
		setIsExportCSVDialogOpen(false);
	}

	async function getLeads() {
		try {
			setLoading(true);
			// const response = await Get(
			// 	1,
			// 	"get_leads_data",
			// 	{
			// 		page,
			// 		per_page,
			// 		filter_by,
			// 		filter,
			// 		sort_by: sort_by || "created_at",
			// 		sort_direction: sort_direction || "desc",
			// 	},
			// 	axiosCancelSource.token
			// );
			console.log(page);
			
			setLeads(leadsData[page].data.data);
			setCount(leadsData[page].data.last_page);
			setLoading(false);
		} catch (error) {
			if (error.message !== REQUEST_CANCELED_MESSAGE) setLoading(false);
		}
	}
	// This function handles changes in the sorting model and updates the URL parameters accordingly.
	async function handleSortModelChange(sortModel) {
		const searchParams = new URLSearchParams(location.search);

		// Get the field to sort by from the sortModel, if available.
		const sort_by = sortModel?.[0]?.field;

		// If 'sort_by' is defined, set it as a query parameter; otherwise, remove it.
		if (sort_by) searchParams.set("sort_by", sortModel?.[0]?.field);
		else searchParams.delete("sort_by");

		// Get the sorting direction from the sortModel, if available.
		const sort_direction = sortModel?.[0]?.sort;

		// If 'sort_direction' is defined, set it as a query parameter; otherwise, remove it.
		if (sort_direction)
			searchParams.set("sort_direction", sortModel?.[0]?.sort);
		else searchParams.delete("sort_direction");

		// Replace the current URL with the updated query parameters.
		history.replace(`${location.pathname}?${searchParams.toString()}`);
	}

	// This function handles changes in the filter mode and updates the URL parameters accordingly.
	async function onFilterChange(filterMode) {
		const searchParams = new URLSearchParams(location.search);

		// Get the field to filter by from the filterMode's items, if available.
		const filter_by = filterMode.items[0]?.field;

		// If 'filter_by' is defined, set it as a query parameter; otherwise, remove it.
		if (filter_by) searchParams.set("filter_by", filter_by);
		else searchParams.delete("filter_by");

		// Get the filter value from the filterMode's items, if available.
		const filter = filterMode.items[0]?.value;

		// If 'filter' is defined, set it as a query parameter; otherwise, remove it.
		if (filter) searchParams.set("filter", filter);
		else searchParams.delete("filter");

		// Replace the current URL with the updated query parameters.
		history.replace(`${location.pathname}?${searchParams.toString()}`);
	}

	useEffect(() => {
		getLeads();

		return () => {
			axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
		};
	}, [
		page,
		per_page,
		filter_by,
		filter,
		sort_by,
		sort_direction,
		filter,
		org.host_url,
	]);

	const handleCopy = useCallback(async (textToCopy) => {
		await navigator.clipboard.writeText(textToCopy);
		toast.success(`Copied ${textToCopy}`);
	}, []);

	const columns = useMemo(
		() => [
			{
				field: "name",
				headerName: "Name",
				align: "left",
				headerAlign: "left",
				flex: 1,
				filterable: false,
				renderCell: (params) => (
					<Tooltip
						style={{ cursor: "pointer" }}
						title="Click to Copy"
						onClick={() => handleCopy(params.value)}
					>
						{params.value}
					</Tooltip>
				),
			},
			{
				field: "email",
				headerName: "Email",
				align: "left",
				headerAlign: "left",
				flex: 1,
				filterOperators: getGridStringOperators().filter(
					(operator) => operator.value === "contains"
				),
				renderCell: (params) => (
					<Tooltip
						style={{ cursor: "pointer" }}
						title="Click to Copy"
						onClick={() => handleCopy(params.value)}
					>
						{params.value}
					</Tooltip>
				),
			},
			{
				field: "phone",
				headerName: "Phone",
				align: "left",
				headerAlign: "left",
				flex: 1,
				filterOperators: getGridNumericOperators().filter(
					(operator) => operator.value === ">="
				),
				renderCell: (params) =>
					params?.value?.phone ? (
						<>
							<Tooltip
								style={{ cursor: "pointer" }}
								title="Click to Copy"
								onClick={() => handleCopy(params.value)}
							>
								{`${
									params?.value?.country_code
										? "+" + params?.value?.country_code
										: ""
								} ${params?.value?.phone}`}
							</Tooltip>
							<Tooltip title="Open on Whatsapp">
								<IconButton
									onClick={() => {
										window.open(
											`https://wa.me/${params?.value?.country_code ?? ""}${
												params?.value?.phone
											}`,
											"_blank"
										);
									}}
								>
									<WhatsAppIcon sx={{ color: "#25D366" }} />
								</IconButton>
							</Tooltip>
						</>
					) : (
						<>-</>
					),
			},
			{
				field: "location",
				headerName: "Location",
				align: "left",
				headerAlign: "left",
				sortable: false,
				flex: 1,
				filterable: false,
			},
			{
				field: "lead_score",
				headerName: "Confidence",
				align: "left",
				headerAlign: "left",
				flex: 0.5,
				filterable: false,
				renderCell: (params) => (
					<>
						{params.value?.lead_score ? (
							<>{params.value?.lead_score}&nbsp;</>
						) : (
							""
						)}
						<AIAnalysis
							chatId={params.value?.chat_id}
							disabled={!params.value?.msg_count}
							updateAnalysis={updateAnalysis}
						/>
					</>
				),
			},
			{
				field: "created_at",
				headerName: "Created At",
				align: "left",
				headerAlign: "left",
				flex: 0.6,
				filterable: false,
			},
			{
				field: "chat",
				headerName: "Chat",
				align: "center",
				headerAlign: "left",
				flex: 0.4,
				filterable: false,
				sortable: false,
				disableColumnMenu: true,
				disableReorder: true,
				hideSortIcons: true,
				renderCell: (params) => (
					<Tooltip
						title={
							params.value?.msg_count ? "Open Chat" : "No Messages Available"
						}
					>
						<span>
							<Button
								component={Link}
								variant="outlined"
								to={`/${encodeURIComponent(org.host_url)}/${
									params.value?.chat_id
								}`}
								disabled={!params.value?.msg_count}
								size="small"
							>
								View
							</Button>
						</span>
					</Tooltip>
				),
			},
		],
		[handleCopy, org.host_url, updateAnalysis]
	);

	const rows = useMemo(
		() =>
			leads.map((lead, index) => ({
				id: lead.chat_id,
				created_at: new Date(lead.created_at).toLocaleDateString(),
				name: lead.creator.name ?? "-",
				email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
					lead.creator.email
				)
					? lead.creator.email
					: "-",
				phone: {
					phone: lead.creator.phone,
					country_code: lead.creator?.country?.phone_code,
				},
				location: `${lead.creator.city ?? "-"}, ${
					lead.creator?.country?.name ?? "-"
				}`,
				lead_score: {
					lead_score: lead.lead_score,
					chat_id: lead.chat_id,
					msg_count: lead.msg_count,
				},
				chat: {
					chat_id: lead.chat_id,
					msg_count: lead.msg_count,
				},
				blurred:
					plan.leads !== PLAN_UNLIMITED && index >= plan.leads && !is_god,
			})),
		[is_god, leads, plan.leads]
	);
	return (
		<Box sx={{ padding: "10px", borderRadius: "8px", height: "100%" }}>
			{isSmScreen ? <Box>
				{leads?.map((lead, index) => (
					<Lead key={lead.chat_id} lead={lead} updateAnalysis={updateAnalysis} />
				))}
			</Box>
			: <Box sx={{ width: "100%", height: 578, minWidth: "960px" }}>
				<DataGrid
					rows={rows}
					columns={columns}
					loading={loading}
					sortingMode="server"
					sortModel={[
						{
							field: sort_by,
							sort: sort_direction,
						},
					]}
					onSortModelChange={handleSortModelChange}
					filterMode="server"
					filterDebounceMs={600}
					slots={{
						noRowsOverlay: CustomNoRowsOverlay,
					}}
					getRowClassName={(params) => {
						return params.row?.blurred ? "blurred-row" : "";
					}}
					slotProps={{
						noRowsOverlay: {
							title:
								"Looks like your website visitors have not yet started chatting",
						},
					}}
					filterModel={
						filter
							? {
									items: [
										{ field: filter_by, operator: "contains", value: filter },
									],
								}
							: undefined
					}
					onFilterModelChange={onFilterChange}
					disableSelectionOnClick
					disableRowSelectionOnClick
					hideFooter
				/>
			</Box>}
			<Stack spacing={2} alignItems="center" my={1}>
				<Pagination
					page={page}
					count={count}
					sx={{ m: "10px auto" }}
					color="primary"
					renderItem={(item) => {
						const searchParams = new URLSearchParams(location.search);
						searchParams.set("page", item.page);
						return (
							<PaginationItem
								component={Link}
								to={`${location.pathname}?${searchParams.toString()}`}
								{...item}
							/>
						);
					}}
				/>
			</Stack>
			<Stack spacing={2} alignItems="center" my={1}>
				<Button onClick={openExportLeadsDialog} variant="outlined">
					Export CSV
				</Button>
			</Stack>
			<Suspense fallback={<></>}>
				<ExportLeadsDialog
					open={isExportCSVDialogOpen}
					onClose={closeExportLeadsDialog}
				/>
			</Suspense>
		</Box>
	);
};

export default withErrorBoundary(LeadData, "LeadData");
