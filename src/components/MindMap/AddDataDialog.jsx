import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm } from "react-hook-form";
import PublishIcon from "@mui/icons-material/Publish";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { toast } from "react-toastify";
import { Box, Checkbox } from "@mui/material";
import { MenuItem } from "@mui/material";
import axios from "axios";
import InputAdornment from "@mui/material/InputAdornment";

import { useApiCall } from "components/common/appHooks.js";
import MuiDialog from "components/common/MuiDialog";
import templateCSV from "assets/CSV Template.csv";
import { useOrgContext } from "context/OrgContext";
import { useUserContext } from "context/UserContext";
import {
	FEATURE_DISABLED_MESSAGE,
	FILE_ALREADY_UPLOADED,
	REQUEST_CANCELED_MESSAGE,
	TEXT_MAX_TOKENS,
} from "components/common/constants";

// Also see ViewTrainingStatusDialog
const PDF = "1";
const TEXT = "2";
const LINK = "3";
const EPUB = "4";
const CSV = "5";

const types = {
	[PDF]: "PDF",
	[TEXT]: "Text",
	[LINK]: "Link",
	[EPUB]: "EPUB",
	[CSV]: "CSV",
};
const AddDataDialog = ({ openAddDialog, setOpenAddDialog, setData }) => {
	const { Post, Get } = useApiCall();
	const { isDemo } = useOrgContext();
	const { trackOnDashboard } = useApiCall();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
		watch,
	} = useForm({
		defaultValues: {
			title: "",
			description: "",
			link: "",
			read_more_link: "",
			bucket_id: "",
		},
	});
	const description = watch("description", "");
	const axiosCancelSource = axios.CancelToken.source();
	const [buckets, setBuckets] = useState([]);

	const [type, setType] = useState(TEXT);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [forceUpload, setForceUpload] = useState(false);
	const [showForceUpload, setShowForceUpload] = useState(false);
	const [businessActions, setBusinessAction] = useState([]);

	const {
		user: { is_god },
	} = useUserContext();

	const isFile = useMemo(() => [PDF, EPUB, CSV].includes(type), [type]);

	async function onSubmit({
		title,
		description,
		link,
		read_more_link,
		bucket_id,
	}) {
		let forceUploadNeeded = false;
		if (isDemo && !is_god) {
			trackOnDashboard("Tried to add data for training");
			toast.info(FEATURE_DISABLED_MESSAGE);
			return;
		}
		try {
			const data = new FormData();
			data.append("type", type);
			if (type === TEXT) {
				data.append("data", (title ? title + "\n" : "") + description);
			}
			if (type === LINK) {
				data.append("data", link);
			}
			if (read_more_link) {
				data.append("read_more_link", read_more_link);
			}
			if (bucket_id) {
				data.append("bucket_id", bucket_id);
			}

			if (isFile) {
				if (forceUpload) {
					data.append("force_upload", Number(true));
				}
				for (let i = 0; i < selectedFiles.length; i++) {
					const selectedFile = selectedFiles[i];
					data.append("data", selectedFile);
					try {
						await Post(1, `add_data_to_vector_db`, data, undefined, {
							showProgress: true,
						});
						setSelectedFiles((prev) => prev.slice(1));
					} catch (error) {
						toast.error(error?.response?.data?.message ?? "Failed to add data");
						if (error?.response?.data?.message === FILE_ALREADY_UPLOADED) {
							setShowForceUpload(true);
							forceUploadNeeded = true;
						}
					}
				}
			} else {
				await Post(1, `add_data_to_vector_db`, data, undefined, {
					showProgress: true,
				});
			}
			trackOnDashboard("Added Data for training");
			if (!forceUploadNeeded) {
				toast.dismiss();
				toast.success("Data Added for processing");
				resetForm();
				handleClose();
			}
		} catch (error) {
			console.error("Error updating data:", error);
			toast.error(error?.response?.data?.message ?? "Failed to add data");
			if (error?.response?.data?.message === FILE_ALREADY_UPLOADED) {
				setShowForceUpload(true);
			}
		}
	}
	async function handleClose() {
		// setDescription("");
		setSelectedFiles([]);
		setOpenAddDialog(false);
		setShowForceUpload(false);
		setForceUpload(false);
	}
	async function handleTypeChange(e) {
		setSelectedFiles([]);
		setType(e.target.value);
		setShowForceUpload(false);
		setForceUpload(false);
	}

	async function getBuckets() {
		try {
			const response = await Get(
				1,
				"buckets/view_all",
				axiosCancelSource.token
			);
			setBuckets(response.data.data);
		} catch (error) {
			toast.error(error?.message || "Something Went Wrong");
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

	useEffect(() => {
		if (openAddDialog && is_god) {
			getBuckets();
			getActions();
		}

		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [openAddDialog, is_god]);

	return (
		<MuiDialog
			open={openAddDialog}
			onClose={handleClose}
			title="Add Data"
			onSubmit={handleSubmit(onSubmit)}
			submitDisabled={isFile ? !selectedFiles.length : false}
			submitButtonText="Save"
		>
			<FormControl variant="standard" component="fieldset">
				<RadioGroup
					aria-label="options"
					name="options1"
					value={type}
					onChange={handleTypeChange}
					style={{
						display: "flex",
						gap: 5,
						flexWrap: "wrap",
						flexDirection: "row",
					}}
				>
					{[TEXT, PDF, EPUB, LINK, CSV].map((option) => (
						<FormControlLabel
							key={option}
							value={option}
							control={<Radio style={{ display: "none" }} />}
							label={types[option]} // Capitalize the first letter
							color="primary"
							style={{
								display: "block",
								marginBottom: "10px",
								borderRadius: "4px",
								padding: "10px 20px",
								color: option === type ? "white" : "black",
								backgroundColor: option === type ? "var(--primary)" : "white",
								flex: "0.5",
								border: "2px solid var(--primary)",
							}}
						/>
					))}
				</RadioGroup>
			</FormControl>
			{/* <FormControl className={classes.formControl}>
				<Select
					labelId="input-data-type-label"
					value={type}
					onChange={handleTypeChange}
				>
					<MenuItem value={TEXT}>Text</MenuItem>
					<MenuItem value={PDF}>PDF</MenuItem>
					<MenuItem value={EPUB}>EPUB</MenuItem>
					<MenuItem value={LINK}>Website URL</MenuItem>
					<MenuItem value={CSV}>CSV</MenuItem>
				</Select>
				<FormHelperText>Type of Data to Upload</FormHelperText>
			</FormControl> */}
			{type === TEXT ? (
				<>
					<TextField
						label="Title"
						fullWidth
						margin="normal"
						{...register("title")}
						error={errors?.title?.type}
						helperText={errors?.title?.message}
					/>
					<TextField
						label="Description"
						{...register("description", {
							required: "Required",
							maxLength: {
								value: TEXT_MAX_TOKENS,
								message: `Description exceeds ${TEXT_MAX_TOKENS} characters`,
							},
						})}
						error={errors?.description?.type}
						helperText={errors?.description?.message}
						fullWidth
						multiline
						rows={3}
						margin="normal"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{description.length} / {TEXT_MAX_TOKENS}
								</InputAdornment>
							),
						}}
					/>
				</>
			) : null}
			{isFile ? (
				<div
					style={{
						marginTop: "16px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "column",
					}}
				>
					{selectedFiles.length ? (
						selectedFiles.map((selectedFile) => (
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Typography
									variant="body1"
									style={{
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
										maxWidth: "450px", // Adjust the maximum width as needed
									}}
								>
									{selectedFile.name}
								</Typography>
								<IconButton
									color="secondary"
									aria-label="Remove"
									onClick={() =>
										setSelectedFiles((prev) =>
											prev.filter((file) => file.name !== selectedFile.name)
										)
									}
									size="large"
								>
									<DeleteIcon />
								</IconButton>
							</Box>
						))
					) : (
						<>
							<input
								type="file"
								accept={
									type === EPUB ? ".epub" : type === CSV ? ".csv" : ".pdf"
								}
								style={{ display: "none" }}
								onChange={(e) => setSelectedFiles([...e.target.files])}
								id="pdf-file-input"
								multiple
							/>
							<label htmlFor="pdf-file-input">
								<Button
									variant="contained"
									component="span"
									color="primary"
									endIcon={<PublishIcon />}
								>
									Upload {type === EPUB ? "EPUB" : type === CSV ? "CSV" : "PDF"}
								</Button>
							</label>
							<br />
							{type === CSV ? (
								<Typography variant="subtitle2" align="center">
									Please upload your CSV file in the following format:&nbsp;
									<a
										href={templateCSV}
										download="template.csv"
										style={{ textDecoration: "underline", color: "blue" }}
									>
										Download CSV
									</a>
									. <br />
									Make sure the header is present
								</Typography>
							) : null}
						</>
					)}
					{showForceUpload ? (
						<FormControlLabel
							control={
								<Checkbox
									defaultChecked
									checked={forceUpload}
									onChange={(e) => setForceUpload(e.target.checked)}
								/>
							}
							label="Force Upload?"
						/>
					) : null}
				</div>
			) : null}
			{type === LINK ? (
				<TextField
					label="Link URL"
					{...register("link", {
						required: "Required",
					})}
					error={errors?.link?.type}
					helperText={errors?.link?.message}
					fullWidth
					margin="normal"
				/>
			) : null}
			<TextField
				label="Read More/Source Link"
				fullWidth
				margin="normal"
				{...register("read_more_link")}
				error={errors?.read_more_link?.type}
				helperText={
					errors?.read_more_link?.message ??
					"The Source or Read More link user gets at the end of the message"
				}
			/>
			{is_god && buckets.length ? (
				<>
					<TextField
						select
						fullWidth
						{...register("bucket_id")}
						label="Select Bucket"
            defaultValue=""
            helperText="Bucket in which this data will be added"
					>
						<MenuItem value="">No Bucket</MenuItem>
						{buckets.map((bucket) => (
							<MenuItem value={bucket.id} key={bucket.id}>
								{bucket.title}
							</MenuItem>
						))}
					</TextField>
					<TextField
						fullWidth
						select
						{...register("action_id")}
						label="Business Action"
            defaultValue={""}
            helperText="Action to use when this vector is used for an answer"
					>
						<MenuItem value="">No Action</MenuItem>
						{businessActions.map((businessAction) => (
							<MenuItem value={businessAction.id} key={businessAction.id}>
								{businessAction.name}
							</MenuItem>
						))}
					</TextField>
				</>
			) : null}
		</MuiDialog>
	);
};

export default withErrorBoundary(AddDataDialog, "AddDataDialog");
