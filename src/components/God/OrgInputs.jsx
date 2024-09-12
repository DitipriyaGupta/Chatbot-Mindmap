import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	TextField,
} from "@mui/material";
import React from "react";
import { Controller, useForm } from "react-hook-form";

const OrgInputs = ({
	onSubmit,
	defaultValues = {
		name: "",
		new_host_url: "",
		data_link: "",
		description: "",
		namespace: "",
		pinecone_index: "",
		prompt: "",
		filters: "",
		// email: "",
		unsure_msg: "",
		closure_msg: "",
		chatbot_enabled: true,
	},
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
		control,
	} = useForm({
		defaultValues,
	});

	return (
		<Box
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			sx={{ mt: 2, gap: 2, display: "flex", flexDirection: "column" }}
		>
			<Controller
				control={control}
				name="chatbot_enabled"
				render={({ field: { onChange, value } }) => (
					<FormControlLabel
						control={<Checkbox onChange={onChange} checked={value} />}
						label="Chatbot Enabled"
					/>
				)}
			/>
			<TextField
				{...register("name", { required: "Name is required" })}
				label="Name"
				required
				placeholder="Example"
				variant="outlined"
				fullWidth
				error={!!errors.name}
				helperText={errors.name?.message ?? "Name of the Organization"}
			/>
			<TextField
				{...register("new_host_url", { required: "Host URL is required" })}
				label="Host URL"
				required
				placeholder="example.com"
				variant="outlined"
				fullWidth
				error={!!errors.new_host_url}
				helperText={
					errors.new_host_url?.message ??
					"Host URL of the Organization, must not contain https or www"
				}
			/>
			<TextField
				{...register("data_link", { required: "Data Link is required" })}
				label="Data link"
				required
				placeholder="example.com"
				variant="outlined"
				fullWidth
				error={!!errors.data_link}
				helperText={
					errors.data_link?.message ??
					"Data Link of the Organization, must not contain https or www, will be used in iframe"
				}
			/>
			<TextField
				{...register("description", {
					required: "Description is required",
				})}
				label="Description"
				required
				placeholder="A Super Awesome Website"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.description}
				helperText={
					errors.description?.message ??
					"Description of the Organization, will be used in the Prompt"
				}
			/>
			<TextField
				{...register("namespace")}
				label="Namespace"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.namespace}
				helperText={
					errors.namespace?.message ?? "Namespace That will be used in pinecone"
				}
			/>
			<TextField
				{...register("pinecone_index")}
				placeholder="18-sept-2023"
				label="Pinecone Index"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.pinecone_index}
				helperText={
					errors.pinecone_index?.message ??
					"Pinecone Index That will be used in pinecone"
				}
			/>
			<TextField
				{...register("prompt")}
				label="Prompt"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.prompt}
				helperText={
					errors.prompt?.message ?? "Prompt That will be passed to the bot"
				}
			/>
			<TextField
				{...register("filters", {
					validate: (value) => {
						try {
							JSON.parse(value);
							return true;
						} catch (error) {
							return !Boolean(value);
						}
					},
				})}
				label="Filters"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.filters}
				helperText={
					errors.filters?.message ?? (
						<>
							Filters JSON for pinecone metadata filtering. Read more{" "}
							<a
								style={{ color: "var(--primary)", textDecoration: "underline" }}
								href="https://docs.pinecone.io/docs/metadata-filtering"
								target="_blank"
								rel="noopener noreferrer"
							>
								here
							</a>
						</>
					)
				}
			/>
			{/* <TextField
				{...register("email")}
				label="Email"
				variant="outlined"
				fullWidth
				error={!!errors.email}
				helperText={errors.email?.message ?? "Email of the Organization"}
			/> */}
			<TextField
				{...register("unsure_msg")}
				label="Unsure Message"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.unsure_msg}
				helperText={
					errors.unsure_msg?.message ??
					"How the Bot should response if it is unsure"
				}
			/>
			<TextField
				{...register("closure_msg")}
				label="Closure Message"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.closure_msg}
				helperText={
					errors.closure_msg?.message ?? "Ending Conversation Message"
				}
			/>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				fullWidth
				sx={{ mt: 2 }}
			>
				Submit
			</Button>
			<Button
				variant="outlined"
				color="secondary"
				fullWidth
				// sx={{ mt: 1 }}
				onClick={() => resetForm(undefined, { keepDefaultValues: true })}
			>
				Clear
			</Button>
		</Box>
	);
};

export default withErrorBoundary(OrgInputs, "OrgInputs");
