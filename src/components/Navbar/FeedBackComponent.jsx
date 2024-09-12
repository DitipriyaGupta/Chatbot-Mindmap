import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
// import Feedback from "../../../assets/images/icons/feedback.svg";
import TextField from "@mui/material/TextField";
import DialogContentText from "@mui/material/DialogContentText";
import React, { useState } from "react";
import { Post } from "../common/common";
import MuiDialog from "../common/MuiDialog";
import { useUserContext } from "context/UserContext";
import Swal from "sweetalert2/dist/sweetalert2";

const FeedBackComponent = (props) => {
	const { open, handleClose } = props;
	const { user } = useUserContext();
	const [name, setName] = useState(user.name ?? "");
	const [email, setEmail] = useState(user.email ?? "");
	const [message, setMessage] = useState("");

	const handleSubmit = async () => {
		try {
			await Post(0, "submit_feedback", { name, email, message });
			Swal.fire("Success", "Feedback added successfully", "success");
			setMessage("");
			handleClose();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<MuiDialog
			open={open}
			onClose={handleClose}
			title="Feedback"
			onSubmit={handleSubmit}
		>
			<DialogContentText>
				To submit feedback, please enter the details in below input field.
			</DialogContentText>
			<TextField
				variant="standard"
				{...(name ? {} : { autoFocus: true })}
				margin="dense"
				id="name"
				name="name"
				label="Name"
				type="text"
				value={name}
				onChange={(e) => {
					setName(e.target.value);
				}}
				fullWidth
			/>
			<TextField
				variant="standard"
				margin="dense"
				id="email"
				name="email"
				label="E-mail"
				type="email"
				value={email}
				onChange={(e) => {
					setEmail(e.target.value);
				}}
				fullWidth
			/>
			<TextField
				variant="standard"
				{...(name ? { autoFocus: true } : {})}
				margin="dense"
				id="feedback"
				label="Feedback"
				type="text"
				name="message"
				value={message}
				onChange={(e) => {
					setMessage(e.target.value);
				}}
				fullWidth
			/>
		</MuiDialog>
	);
};

export default withErrorBoundary(FeedBackComponent, "FeedBackComponent");
