import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import HistoryIcon from "@mui/icons-material/History";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PaginationItem from "@mui/material/PaginationItem";
import makeStyles from "@mui/styles/makeStyles";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import { Chip, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import Swal from "sweetalert2/dist/sweetalert2";
import { useMediaQuery, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useOrgContext } from "context/OrgContext";
import { useApiCall } from "components/common/appHooks.js";
import { usePlanContext } from "context/PlanContext";
import InboxIcon from "@mui/icons-material/Inbox";
import InputAdornment from "@mui/material/InputAdornment";
import {
    PLANS_LIMIT_REACHED,
    PLAN_UNLIMITED,
} from "components/common/constants";
import { useUserContext } from "context/UserContext";
import { DialogLoader, SmallLoader } from "components/common/NewLoader";
import { fromUnixTime } from "date-fns";
import ReadMoreLess from "components/common/ReadMoreLess";
import mindMapData from "staticData/mindmap.json";
import { Search } from "@mui/icons-material";
const VectorData = lazy(() => import("./VectorData"));
const CustomNoRowsOverlay = lazy(
    () => import("components/common/CustomNoRowsOverlay")
);
const GroundTruthDialog = lazy(() => import("./GroundTruth/GroundTruthDialog"));
const BucketsDialog = lazy(() => import("./Buckets/BucketsDialog"));
const ViewTrainingStatusDialog = lazy(
    () => import("./ViewTrainingStatusDialog")
);
const AddDataDialog = lazy(() => import("./AddDataDialog"));
const EditDataDialog = lazy(() => import("./EditDataDialog"));
 
const useStyles = makeStyles((theme) => ({
    table: {
        maxWidth: 1600,
        // "& .MuiTableCell-root": {
        //  padding: "14px",
        // },
        "& thead th": {
            position: "sticky",
            top: 0,
            color: "var(--white)",
            backgroundColor: "var(--primary)",
            fontWeight: "bold",
        },
        "& tbody tr:nth-child(even)": {
            backgroundColor: " #2872FA14",
            color: "var(--color5)",
        },
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100px",
    },
    titleContainer: {
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "column",
        margin: "20px auto",
        
    },
    pagination: {
        margin: "10px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    tableRow: {
        whiteSpace: "break-spaces",
    },
    action_box: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        marginBottom: "0.5rem",
        width: "100%",
        padding: "0px 35px 0px",
        [theme.breakpoints.down("sm")]: {
          flexDirection: "column",
          alignItems: "stretch",
          padding: "0px 20px",
        },
      },
    search_container: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
        },
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        gap: "0.5rem",
        [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            width: "100%",
        },
    },
    customButton: {
        color: "#6028FA",
        borderColor: "#6028FA",
        "&:hover": {
            borderColor: "#6028FA",
            backgroundColor: "rgba(96, 40, 250, 0.08)",
        },
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-around",
        gap: "0.5rem",
        [theme.breakpoints.down("sm")]: {
          flexDirection: "column",
          width: "100%",
        },
      },
      mobileButtonRow: {
        display: "flex",
        gap: "8px",
        width: "100%",
      },
      addDataButton: {
        backgroundColor: "#2872FA",
        color: "white",
        flex: -1,
        height: "42px",
        borderRadius: "5px",
        textTransform: "none",
        fontSize: "12px",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#1c5fd9",
        },
      },
      dataTrainingButton: {
        backgroundColor: "#3F9749",
        color: "white",
        flex: 1,
        height: "42px",
        borderRadius: "5px",
        textTransform: "none",
        fontSize: "12px",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#0e9d5a",
        },
      },
      groundTruthsButton: {
        backgroundColor: "white",
        marginLeft: "25%",
        color: "#6028FA",
        border: "1px solid #6028FA",
        width: "100%",
        height: "44px",
        width: "50%",
        borderRadius: "5px",
        textTransform: "none",
        fontSize: "12px",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "rgba(96, 40, 250, 0.08)",
        },
      },
      buttonIcon: {
        marginRight: "8px",
      },
}));
 
const MindMap = () => {
    const { Post, Get } = useApiCall();
    const classes = useStyles();
    const {
        user: { is_god },
    } = useUserContext();
    const { org } = useOrgContext();
    const { plan } = usePlanContext();
    const theme = useTheme();
    const isSmScreen = useMediaQuery(theme.breakpoints.down("sm"));
 
    const [data, setData] = useState([]);
 
    const [openGroundTruthDialog, setOpenGroundTruthDialog] = useState(false);
    const [openBucketsDialog, setOpenBucketsDialog] = useState(false);
 
    const location = useLocation();
    const { search } = location;
    const query = useMemo(() => new URLSearchParams(search), [search]);
    const page = Number(query.get("page")) || 1;
    const sortBy = Number(query.get("sort_by")) || undefined;
    const order = Number(query.get("order")) || undefined;
 
    const [count, setCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset: resetForm,
    } = useForm({
        defaultValues: {
            q: "",
            numResults: 3,
        },
    });
 
    // Edit Dialog
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editData, setEditData] = useState(null);
 
    // Add Dialog
    const [openAddDialog, setOpenAddDialog] = useState(false);
    // Tasks
    const [openTasksDialog, setOpenTasksDialog] = useState(false);
    const fetchData = async ({ per_page = 10 } = {}) => {
        try {
            setLoading(true);
            // const response = await Get(1, "view_vectors", {
            //  page,
            //  per_page,
            //  sortBy: sortBy || undefined,
            //  order: order || undefined,
            // });
            setData(mindMapData[page].data.data);
            setTotal(mindMapData[page].data.total);
            setCount(mindMapData[page].data.last_page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };
 
    async function clearResults() {
        setHasSearched(false);
        resetForm(undefined, { keepDefaultValues: true });
        fetchData();
    }
 
    async function handleOpenGroundTruthDialog() {
        setOpenGroundTruthDialog(true);
    }
    async function handleOpenBucketsDialog() {
        setOpenBucketsDialog(true);
    }
    async function searchVectors({ q, numResults }) {
        try {
            setLoading(true);
            const response = await Post(1, "search_vectors", {
                q,
                num_results: numResults,
            });
            setData(response.data.data);
            setHasSearched(true);
            setCount(1);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }
 
    // TODO: disabled from backend
    // const handleSort = useCallback((column) => {
    //  setData([]);
    //  const searchParams = new URLSearchParams(search);
    //  switch (searchParams.get("order")) {
    //      case "desc":
    //          searchParams.set("order", "asc");
    //          break;
    //      case "asc":
    //          searchParams.delete("order");
    //          break;
    //      default:
    //          searchParams.set("order", "desc");
    //          break;
    //  }
    //  searchParams.set("page", 1);
    //  searchParams.set("sort_by", column);
    //  history.push({ search: searchParams.toString() });
    // }, []);
 
    const columns = useMemo(
        () => [
            {
                field: "data",
                headerName: "Data",
                align: "left",
                headerAlign: "left",
                flex: 1,
                filterable: false,
                renderCell: (params) => (
                    <Box sx={{ py: 2, px: 1 }}>
                        <ReadMoreLess height={50}>
                            {params.row.metadata.text}
                            {params.row.metadata.read_more_link ? (
                                <>
                                    {" "}
                                    <a
                                        style={{ textDecoration: "underline" }}
                                        target="_blank"
                                        href={params.row.metadata.read_more_link}
                                        rel="noreferrer"
                                    >
                                        {params.row.metadata?.read_more_label || "Read More"}
                                    </a>
                                </>
                            ) : (
                                ""
                            )}
                        </ReadMoreLess>
                    </Box>
                ),
            },
            {
                field: "source",
                headerName: "Source",
                align: "center",
                headerAlign: "center",
                filterable: false,
                renderCell: (params) => {
                    try {
                        new URL(params.row.metadata.source_url);
                        return (
                            <Typography
                                variant="subtitle2"
                                component="a"
                                href={params.row.metadata.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "underline" }}
                            >
                                Open Link
                            </Typography>
                        );
                    } catch (error) {
                        return <Typography variant="subtitle2">--</Typography>;
                    }
                },
            },
            ...(hasSearched
                ? [
                        {
                            field: "score",
                            headerName: "Score",
                            align: "center",
                            headerAlign: "center",
                            filterable: true,
                            renderCell: (params) => (
                                <Typography variant="subtitle2">{params.row.score}</Typography>
                            ),
                        },
                    ]
                : []),
            {
                field: "type",
                headerName: "Type",
                align: "center",
                headerAlign: "center",
                filterable: true,
                renderCell: (params) => (
                    // TODO: Add color for diffrent types
                    <Chip
                        label={params.row.metadata.source_type}
                        variant="outlined"
                        color="primary"
                        size="small"
                    />
                ),
            },
            {
                field: "created_at",
                headerName: "Created At",
                align: "center",
                headerAlign: "center",
                filterable: true,
                renderCell: (params) => (
                    <Typography variant="subtitle2">
                        {fromUnixTime(
                            params.row?.metadata?.created_at
                        ).toLocaleDateString()}
                    </Typography>
                ),
            },
            // {
            //  id: "read_more_link",
            //  label: "Link",
            // },
            // {
            //  id: "updated_at",
            //  label: "Updated At",
            // },
            // { id: "read_more_link", label: "Link" },
            // { id: "updated_at", label: "Updated At" }
            {
                field: "actions",
                headerName: "Actions",
                align: "center",
                headerAlign: "center",
                filterable: false,
                renderCell: (params) => (
                    <>
                        <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(params.row)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            onClick={() => handleDelete(params.row.vector_id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </>
                ),
            },
        ],
        [hasSearched]
    );
 
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
                setData((prevData) => prevData.filter((item) => item.vector_id !== id));
 
                toast.success("Data has been deleted");
            }
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.error("Failed to delete data.");
        }
    }
 
    const handleOpenAddDialog = async () => {
        if (plan.training !== PLAN_UNLIMITED && total >= plan.training && !is_god) {
            return toast.info(PLANS_LIMIT_REACHED);
        }
        setOpenAddDialog(true);
    };
    const handleOpenTasksDialog = async () => {
        setOpenTasksDialog(true);
    };
 
    useEffect(() => {
        setData([]);
        // setCount(0);
        fetchData();
        // return addBeyondChat();
    }, [org.host_url, page, order, sortBy]);
    const getRowId = (row) => row.vector_id; // Assuming vector_id is the unique identifier for each row
 
    return (
        <>
            {isSmScreen ? (
                <Box sx={{mt:2, p:"0px 20px 0px" }}>
                    <Typography variant="h4">
                        This is the brain and the memory of the chatbot.
                        <br />
                        You can add, edit and analyse the source data being used to answer
                        user queries from here.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ ml: 4, mt: 2 }}>
                    <Typography variant="h5">
                        This is the brain and the memory of the chatbot.
                        <br />
                        You can add, edit and analyse the source data being used to answer
                        user queries from here.
                    </Typography>
                </Box>
            )}
            <div className={classes.titleContainer}>
                <Box className={classes.action_box}>
                    <form
                        onSubmit={handleSubmit(searchVectors)}
                        className={classes.search_container}
                    >
                        <TextField
                            label="Search"
                            size="small"
                            variant="outlined"
                            id="input-with-icon-textfield"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button type="submit" variant="contained" size="small">
                                            Search
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                            error={errors?.q?.type}
                            helperText={errors?.q?.message}
                            sx={{ mt: 1 }}
                            {...register("q", {
                                required: "Required",
                            })}
                        />
 
                        {/* <TextField
                        select
                        label="Results"
            defaultValue={3}
            sx={{ m: 1, width: 70 }}
            size="small"
                        {...register("numResults")}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50].map((value) => (
                            <MenuItem key={value} value={value}>
                                {value}
                            </MenuItem>
                        ))}
                    </TextField> */}
 
                        {hasSearched ? (
                            <Button
                                color="secondary"
                                variant="outlined"
                                sx={{ my: 1 }}
                                onClick={clearResults}
                            >
                                Clear Results
                            </Button>
                        ) : null}
                    </form>
                    {isSmScreen ? (
            <>
              <Box className={classes.mobileButtonRow}>
                <Button
                  variant="contained"
                  className={classes.addDataButton}
                  onClick={handleOpenAddDialog}
                >
                  <AddIcon className={classes.buttonIcon} />
                  Add Data
                </Button>
                <Button
                  variant="contained"
                  className={classes.dataTrainingButton}
                  onClick={handleOpenTasksDialog}
                >
                  <HistoryIcon className={classes.buttonIcon} />
                  Data Training Status
                </Button>
              </Box>
              <Button
                variant="outlined"
                className={classes.groundTruthsButton}
                onClick={handleOpenGroundTruthDialog}
              >
                <QuestionAnswerIcon className={classes.buttonIcon} />
                Ground Truths
              </Button>
            </>
          ) : (
            <Box className={classes.buttonGroup}>
              {/* Desktop buttons remain unchanged */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Add Data
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<HistoryIcon />}
                onClick={handleOpenTasksDialog}
              >
                Data Training Status
              </Button>
              <Button
                variant="outlined"
                className={classes.customButton}
                startIcon={<QuestionAnswerIcon />}
                onClick={handleOpenGroundTruthDialog}
              >
                Ground Truths
              </Button>
              {is_god ? (
                <Button
                  variant="outlined"
                  startIcon={<InboxIcon />}
                  onClick={handleOpenBucketsDialog}
                >
                  Buckets
                </Button>
              ) : null}
            </Box>
          )}
                </Box>
                {isSmScreen ? (
                    <hr
                        style={{
                            width: "90%",
                            margin: "10px 0",
                            border: "0.5px solid grey",
                        }}
                    />
                ) : (
                    <hr
                        style={{
                            width: "100%",
                            margin: "10px 0",
                            border: "0.5px solid grey",
                        }}
                    />
                )}
            </div>
 
            <Box sx={{ padding: "10px", borderRadius: "8px", height: "100%" }}>
                {isSmScreen ? (
                    loading ? (
                        <SmallLoader />
                    ) : (
                        <Suspense fallback={<SmallLoader />}>
                            <Box>
                                {data.map((item) => (
                                    <VectorData
                                        key={item.vector_id}
                                        data={item}
                                        handleOpenEditDialog={handleOpenEditDialog}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                            </Box>
                        </Suspense>
                    )
                ) : (
                    <Box sx={{ width: "100%", minWidth: "960px",padding:"1px 25px 0px" }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            loading={loading}
                            autoHeight
                            getRowId={getRowId}
                            slots={{
                                noRowsOverlay: CustomNoRowsOverlay,
                            }}
                            slotProps={{
                                noRowsOverlay: {
                                    title:
                                        "Looks like you have not added any data, click on the Add Data Button above",
                                },
                                loadingOverlay: {
                                    title: "Loading...",
                                },
                            }}
                            disableSelectionOnClick
                            disableRowSelectionOnClick
                            hideFooter
                            getRowHeight={() => "auto"}
                        />
                    </Box>
                )}
 
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
            </Box>
 
            <Suspense fallback={<></>}>
                <AddDataDialog {...{ openAddDialog, setData, setOpenAddDialog }} />
            </Suspense>
            <Suspense fallback={<></>}>
                <ViewTrainingStatusDialog
                    {...{ openTasksDialog, setOpenTasksDialog }}
                />
            </Suspense>
            <Suspense fallback={<DialogLoader />}>
                {openEditDialog && editData ? (
                    <EditDataDialog
                        {...{
                            editData,
                            setData,
                            openEditDialog,
                            setOpenEditDialog,
                            handleCloseEditDialog,
                        }}
                    />
                ) : null}
            </Suspense>
            <Suspense fallback={<DialogLoader />}>
                {openGroundTruthDialog ? (
                    <GroundTruthDialog
                        {...{
                            openGroundTruthDialog,
                            setOpenGroundTruthDialog,
                        }}
                    />
                ) : null}
            </Suspense>
            <Suspense fallback={<DialogLoader />}>
                {openBucketsDialog ? (
                    <BucketsDialog
                        {...{
                            openBucketsDialog,
                            setOpenBucketsDialog,
                        }}
                    />
                ) : null}
            </Suspense>
        </>
    );
};
 
export default withErrorBoundary(MindMap, "MindMap");