import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	TextField,
	Tooltip,
} from "@mui/material";
import MuiDialog from "components/common/MuiDialog";
import { useApiCall } from "components/common/appHooks.js";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";
import { useForm } from "react-hook-form";

const BUTTON = "1";
const MCQ = "2";
const TEXT_INPUT = "3";

const types = {
	[BUTTON]: "Button",
	[MCQ]: "MCQ",
	[TEXT_INPUT]: "Text Input",
};

const AddBusinessActionDialog = ({ open, onClose }) => {
	const { Post } = useApiCall();
	const { setBusinessAction } = useChatConfigContext();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm({
		defaultValues: {
			name: "",
			buttonLink: "",
		},
	});
	const [type, setType] = useState(BUTTON);
	async function handleTypeChange(e) {
		setType(e.target.value);
	}

	const addBusinessAction = async ({ name, buttonLink }) => {
		try {
			const response = await Post(1, "actions/create", {
				name,
				type: Number(type) ?? null,
				detail: buttonLink ? JSON.stringify({ link: buttonLink }) : undefined,
			});
			toast.success("Business Action Added Successfully!");
			setBusinessAction((prev) => [...prev, response.data.data]);
			resetForm();
			onClose();
		} catch (error) {
			console.error(error);
			toast.error(error?.response?.data?.message ?? "Something Went Wrong");
		}
	};

	return (
		<MuiDialog
			open={open}
			onClose={onClose}
			onSubmit={handleSubmit(addBusinessAction)}
			title="Add Business Action"
		>
			<FormControl
				variant="standard"
				component="fieldset"
				sx={{ width: "100%" }}
			>
				<FormLabel id="action-radio-buttons-group-label">Action Type</FormLabel>
				<RadioGroup
					aria-labelledby="action-radio-buttons-group-label"
					name="businessActionType"
					value={type}
					onChange={handleTypeChange}
					style={{
						display: "flex",
						gap: 5,
						flexWrap: "wrap",
						flexDirection: "row",
						justifyContent: "flex-start",
						// width: "100%",
						textAlign: "center",
						marginBottom: 20,
					}}
				>
					{[BUTTON, MCQ, TEXT_INPUT].map((option) => (
						// TODO: remove tooltip
						<Tooltip title={option === BUTTON ? "" : "Coming Soon!"} arrow>
							<FormControlLabel
								key={option}
								value={option}
								control={<Radio style={{ display: "none" }} />}
								label={types[option]} // Capitalize the first letter
								color="primary"
								disabled={option !== BUTTON}
								style={{
									display: "block",
									marginBottom: "auto",
									marginRight: 0,
									marginLeft: 0,
									borderRadius: "4px",
									padding: "10px 20px",
									color: option === type ? "white" : "black",
									backgroundColor: option === type ? "var(--primary)" : "white",
									// flex: "0.5",
									border: `2px solid ${
										option === BUTTON
											? "var(--primary)"
											: "var(--primary-light)"
									}`,
									width: "min-content",
									whiteSpace: "nowrap",
								}}
							/>
						</Tooltip>
					))}
				</RadioGroup>
			</FormControl>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					gap: 5,
				}}
			>
				<TextField
					{...register("name", {
						required: "Required",
					})}
					error={errors?.name?.type}
					helperText={errors?.name?.message}
					placeholder="Whatsapp us"
					fullWidth
				/>

				<TextField
					{...register("buttonLink", {
						required: "Required",
					})}
					error={errors?.buttonLink?.type}
					helperText={errors?.buttonLink?.message}
					classes={{}}
					fullWidth
					placeholder="https://wa.me/1XXXXXXXXXX"
				/>
			</div>
		</MuiDialog>
	);
};

export default withErrorBoundary(
	AddBusinessActionDialog,
	"AddBusinessActionDialog"
);
