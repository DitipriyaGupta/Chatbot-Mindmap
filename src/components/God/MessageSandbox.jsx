import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import {
	Box,
	Button,
	Container,
	FormControlLabel,
	IconButton,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { useApiCall } from "components/common/appHooks.js";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { SmallLoader } from "components/common/NewLoader";
import { useOrgContext } from "context/OrgContext";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import { useFieldArray, useForm } from "react-hook-form";
import ReadMoreLess from "components/common/ReadMoreLess";
import DeleteIcon from "@mui/icons-material/Delete";

const MessageSandbox = () => {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const {
		org: { host_url },
	} = useOrgContext();
	const [response, setResponse] = useState();
	const [sendMessageParams, setSendMessageParams] = useState({});
	const [loading, setLoading] = useState(true);

	async function getOrgDetails() {
		try {
			setLoading(true);

			const [messageParams, buckets] = await Promise.all([
				Get(
					1,
					"get_sandbox_meta_data_of_org",
					{ host_url },
					axiosCancelSource.token
				),
				Get(1, "buckets/view_all", { host_url }, axiosCancelSource.token),
			]);
			setSendMessageParams({
				...messageParams.data.data,
				buckets: buckets.data.data,
				messages: [
					{
						sender: "USER",
						message: "Hi",
					},
				],
			});
			setLoading(false);
		} catch (error) {
			if (error.message !== REQUEST_CANCELED_MESSAGE) {
				toast.error(error?.response?.data?.message ?? "Something went wrong");
				setLoading(false);
			}
		}
	}

	useEffect(() => {
		getOrgDetails();
		return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	}, [host_url]);

	async function onSubmit(params) {
		try {
			const response = await Post(1, "sandbox_send_message", params);
			setSendMessageParams((prev) => ({
				...prev,
				messages: [
					...prev.messages,
					{ sender: "AI", message: response.data.data.ai_response.join("") },
				],
				buckets: prev.buckets?.filter((bucket) => Number(bucket.active) === 1),
			}));
		} catch (error) {
			console.error(error);
			axios.isAxiosError(error)
				? toast.error(error.response?.data?.message ?? "Something went wrong")
				: toast.error("Something went wrong");
		}
	}

	return (
		<Container component="main" maxWidth="xs" sx={{ p: 2 }}>
			<>
				<Typography
					variant="h3"
					style={{
						textAlign: "center",
					}}
				>
					Edit Organization
				</Typography>
				{loading ? (
					<SmallLoader />
				) : (
					<OrgInputs onSubmit={onSubmit} defaultValues={sendMessageParams} />
				)}
			</>
			{response ? (
				<Box
					component="pre"
					sx={{
						textWrap: "pretty",
						borderRadius: "8px",
						m: 2,
						p: 1,
						border: "1px solid var(--primary)",
					}}
				>
					{JSON.stringify(response, undefined, 2)}
				</Box>
			) : null}
			{sendMessageParams ? (
				<ReadMoreLess>
					<Box
						component="pre"
						sx={{
							textWrap: "pretty",
							borderRadius: "8px",
							m: 2,
							p: 1,
							border: "1px solid var(--primary)",
						}}
					>
						{JSON.stringify(sendMessageParams, undefined, 2)}
					</Box>
				</ReadMoreLess>
			) : null}
		</Container>
	);
};

export default withErrorBoundary(MessageSandbox, "MessageSandbox");

const OrgInputs = ({ onSubmit, defaultValues = {} }) => {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
		setValue,
	} = useForm({
		defaultValues,
	});

	useEffect(() => {
		Object.entries(defaultValues).forEach(([key, value]) =>
			setValue(key, value)
		);
	}, [defaultValues]);

	const {
		fields: bucketsFields,
		append: appendBucket,
		remove: removeBucket,
	} = useFieldArray({
		control,
		name: "buckets",
	});
	const {
		fields: messagesFields,
		append: appendMessage,
		remove: removeMessage,
	} = useFieldArray({
		control,
		name: "messages",
	});

	return (
		<Box
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			sx={{ mt: 2, gap: 2, display: "flex", flexDirection: "column" }}
		>
			<TextField
				{...register("host_url", { required: "Host URL is required" })}
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
				{...register("org_description", {
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
			<TextField
				{...register("sender_country")}
				label="Sender Country"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.sender_country}
				helperText={errors.sender_country?.message ?? "Country of the User"}
			/>
			<TextField
				{...register("sender_city")}
				label="Sender City"
				variant="outlined"
				fullWidth
				multiline
				error={!!errors.sender_city}
				helperText={errors.sender_city?.message ?? "City of the User"}
			/>
			<Typography align="center">---Buckets Start---</Typography>
			<Typography align="center" variant="subtitle2">
				only id and priority is used by flask
			</Typography>

			{bucketsFields.map((bucket, index) => (
				<React.Fragment key={bucket.id}>
					<TextField
						{...register(`buckets.${index}.title`)}
						label="Bucket Title"
						variant="outlined"
						fullWidth
					/>
					<TextField
						{...register(`buckets.${index}.description`)}
						label="Bucket Description"
						variant="outlined"
						fullWidth
					/>
					<TextField
						{...register(`buckets.${index}.priority`)}
						label="Bucket Priority"
						variant="outlined"
						fullWidth
					/>
					<TextField
						{...register(`buckets.${index}.id`)}
						label="Bucket ID"
						variant="outlined"
						fullWidth
					/>
					<FormControlLabel
						control={<Switch {...register(`buckets.${index}.active`)} />}
						label="Enabled?"
					/>
				</React.Fragment>
			))}
			<Button onClick={appendBucket}>Add New Bucket</Button>
			<Typography align="center">---Buckets End---</Typography>
			<Typography align="center">---Messages Start---</Typography>
			<Typography align="center" variant="subtitle2">
				create a conversation to send to chatbot
			</Typography>

			{messagesFields.map((message, index) => (
				<React.Fragment key={message.id}>
					<TextField
						{...register(`messages.${index}.sender`)}
						label="Message Sender"
						variant="outlined"
						fullWidth
						helperText="Can be AI or USER"
					/>
					<TextField
						{...register(`messages.${index}.message`)}
						label="Message"
						variant="outlined"
						fullWidth
						InputProps={{
							endAdornment: (
								<IconButton onClick={() => removeMessage(index)}>
									<DeleteIcon sx={{ color: "red" }} />
								</IconButton>
							),
						}}
					/>
				</React.Fragment>
			))}
			<Button onClick={appendMessage}>Add New Message</Button>
			<Typography align="center">---Messages End---</Typography>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				fullWidth
				sx={{ mt: 2 }}
			>
				Send Message
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
